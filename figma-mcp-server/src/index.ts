#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { FIGMA_ACCESS_TOKEN, PORT } from './config/index.js';
import { pluginRouter } from './api/plugin-api.js';
import { FigmaServer } from './mcp/figma-server.js';

// アクセストークンの確認
if (!FIGMA_ACCESS_TOKEN) {
  console.error("FIGMA_ACCESS_TOKEN is required");
  process.exit(1);
}

// プラグイン通信用のサーバー設定
const app = express();
const server = http.createServer(app);

// CORSを有効化（プライベートネットワークアクセスを許可）
app.use(cors());
app.use(express.json());

// プライベートネットワークアクセスを許可するためのヘッダーを追加
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// プラグインAPIルーターを設定
app.use('/plugin', pluginRouter);

// MCPサーバーの起動
const mcpServer = new FigmaServer();
// ポートが使用可能かチェックする関数
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => {
        // エラーが発生した場合、ポートは使用中
        resolve(false);
      })
      .once('listening', () => {
        // リスニングできた場合、ポートは利用可能
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

// PIDファイルのパスを取得
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pidFilePath = path.join(__dirname, '..', '.figma-mcp-server.pid');

// ポートを使用しているプロセスを見つける（Macの場合）
async function findProcessUsingPort(port: number): Promise<number | null> {
  return new Promise((resolve) => {
    exec(`lsof -i :${port} -t`, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(null);
        return;
      }
      
      const pid = parseInt(stdout.trim(), 10);
      resolve(isNaN(pid) ? null : pid);
    });
  });
}

// 前回のプロセスが実行中かチェック
function checkPreviousProcess(): boolean {
  try {
    if (fs.existsSync(pidFilePath)) {
      const pid = parseInt(fs.readFileSync(pidFilePath, 'utf8').trim(), 10);
      try {
        // プロセスが存在するかチェック（エラーがなければ存在する）
        process.kill(pid, 0);
        console.error(`Previous process (PID: ${pid}) is still running.`);
        return true;
      } catch (e) {
        // プロセスが存在しない場合、PIDファイルを削除
        fs.unlinkSync(pidFilePath);
      }
    }
  } catch (error) {
    console.error('Error checking previous process:', error);
  }
  return false;
}

// 現在のPIDを保存
function savePid(): void {
  try {
    fs.writeFileSync(pidFilePath, process.pid.toString(), 'utf8');
  } catch (error) {
    console.error('Error saving PID file:', error);
  }
}

// サーバーの起動処理
async function startServer() {
  // 前回のプロセスをチェック
  if (checkPreviousProcess()) {
    console.error('Another instance of figma-mcp-server is already running.');
    console.error('If you are sure no other instance is running, delete the PID file:');
    console.error(`  rm ${pidFilePath}`);
    process.exit(1);
  }

  // ポートの可用性をチェック
  if (!await isPortAvailable(PORT)) {
    console.error(`Port ${PORT} is already in use.`);
    
    // ポートを使用しているプロセスを特定
    const pid = await findProcessUsingPort(PORT);
    if (pid) {
      console.error(`Process with PID ${pid} is using port ${PORT}.`);
      console.error('You can terminate this process with:');
      console.error(`  kill ${pid}`);
    }
    
    console.error('Please terminate the process using port 5678 and try again.');
    process.exit(1);
  }

  // 現在のPIDを保存
  savePid();

  // サーバーの起動
  server.listen(PORT, () => {
    console.error(`Plugin communication server running on port ${PORT}`);
  });

  // MCPサーバーの起動
  await mcpServer.run().catch(console.error);
}

// シャットダウン処理
function shutdown(signal: string) {
  console.error(`Received ${signal}. Shutting down gracefully...`);
  
  // HTTPサーバーのクローズ
  server.close(async () => {
    console.error('HTTP server closed.');
    
    // MCPサーバーのクローズ
    await mcpServer.shutdown();
    console.error('MCP server closed.');
    
    // PIDファイルの削除
    try {
      if (fs.existsSync(pidFilePath)) {
        fs.unlinkSync(pidFilePath);
      }
    } catch (error) {
      console.error('Error removing PID file:', error);
    }
    
    console.error('Shutdown complete.');
    process.exit(0);
  });

  // 5秒後に強制終了（ハングアップ防止）
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);
}

// シグナルハンドラの設定
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

// 予期しない例外のハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});

// サーバー起動
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
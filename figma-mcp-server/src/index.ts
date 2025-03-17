#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import http from 'http';
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

// サーバーの起動
server.listen(PORT, () => {
  console.error(`Plugin communication server running on port ${PORT}`);
});

// MCPサーバーの起動
const mcpServer = new FigmaServer();
mcpServer.run().catch(console.error); 
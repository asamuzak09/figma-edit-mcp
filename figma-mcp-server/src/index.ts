#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import http from 'http';

// アクセストークンの確認
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_ACCESS_TOKEN) {
  console.error("FIGMA_ACCESS_TOKEN is required");
  process.exit(1);
}

// プラグイン通信用のサーバー設定
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORSを有効化
app.use(cors());
app.use(express.json());

// プラグインからの接続を管理
let pluginConnections: Record<string, any> = {};

// プラグインの接続状態を確認するエンドポイント
app.post('/plugin/register', (req, res) => {
  const { pluginId, fileId } = req.body;
  if (!pluginId || !fileId) {
    return res.status(400).json({ error: 'pluginId and fileId are required' });
  }
  
  pluginConnections[fileId] = {
    pluginId,
    lastSeen: new Date(),
    status: 'connected'
  };
  
  console.error(`Plugin ${pluginId} registered for file ${fileId}`);
  res.json({ success: true });
});

// プラグインへのメッセージ送信エンドポイント
app.post('/plugin/message', (req, res) => {
  const { fileId, message } = req.body;
  if (!fileId || !message) {
    return res.status(400).json({ error: 'fileId and message are required' });
  }
  
  const connection = pluginConnections[fileId];
  if (!connection) {
    return res.status(404).json({ error: `No plugin registered for file ${fileId}` });
  }
  
  // ここでは単純に成功を返すが、実際にはプラグインからの応答を待つ必要がある
  console.error(`Message sent to plugin for file ${fileId}: ${JSON.stringify(message)}`);
  res.json({ success: true, message: 'Message sent to plugin' });
});

// プラグインからのポーリングエンドポイント
app.get('/plugin/poll/:fileId/:pluginId', (req, res) => {
  const { fileId, pluginId } = req.params;
  
  // 接続情報を更新
  if (pluginConnections[fileId]) {
    pluginConnections[fileId].lastSeen = new Date();
    pluginConnections[fileId].status = 'connected';
  } else {
    pluginConnections[fileId] = {
      pluginId,
      lastSeen: new Date(),
      status: 'connected'
    };
  }
  
  // ここでキューからメッセージを取得して返す実装が必要
  // 今回はダミーレスポンス
  res.json({ messages: [] });
});

// サーバーの起動
server.listen(PORT, () => {
  console.error(`Plugin communication server running on port ${PORT}`);
});

interface FigmaUpdateParams {
  fileId: string;
  updates: Record<string, any>;
}

class FigmaServer {
  private server: Server;
  private accessToken: string;
  private axiosInstance;

  constructor() {
    this.accessToken = FIGMA_ACCESS_TOKEN!;
    
    // Figma API用のaxiosインスタンスを作成
    this.axiosInstance = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': this.accessToken
      }
    });
    
    this.server = new Server({
      name: "figma-mcp-server",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: []
      })
    );
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [{
          name: "figma_update",
          description: "Updates a Figma file with the specified changes",
          inputSchema: {
            type: "object",
            properties: {
              fileId: {
                type: "string",
                description: "Figma file ID"
              },
              updates: {
                type: "object",
                description: "Changes to apply to the file"
              }
            },
            required: ["fileId", "updates"]
          }
        }]
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        if (request.params.name !== "figma_update") {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        const params = request.params.arguments as unknown as FigmaUpdateParams;
        try {
          const { fileId, updates } = params;
          console.error(`Sending updates to plugin for file ${fileId}`);
          
          // プラグインが接続されているか確認
          const connection = pluginConnections[fileId];
          if (!connection) {
            return {
              content: [{
                type: "text",
                text: `Error: No plugin connected for file ${fileId}. Please open the file in Figma and run the plugin first.`
              }],
              isError: true
            };
          }
          
          // プラグインにメッセージを送信
          try {
            await axios.post(`http://localhost:${PORT}/plugin/message`, {
              fileId,
              message: {
                type: 'update',
                updates
              }
            });
            
            return {
              content: [{
                type: "text",
                text: `Update request sent to Figma plugin for file ${fileId} with changes: ${JSON.stringify(updates)}`
              }]
            };
          } catch (error) {
            console.error('Error sending message to plugin:', error);
            return {
              content: [{
                type: "text",
                text: `Error sending message to plugin: ${error instanceof Error ? error.message : String(error)}`
              }],
              isError: true
            };
          }
        } catch (error) {
          console.error('Error processing update request:', error);
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Figma MCP server running on stdio");
  }
}

const mcpServer = new FigmaServer();
mcpServer.run().catch(console.error); 
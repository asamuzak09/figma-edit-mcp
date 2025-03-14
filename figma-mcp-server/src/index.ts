#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
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

// ファイルごとのメッセージキュー
let messageQueues: Record<string, any[]> = {};

// プラグインの接続状態を確認するエンドポイント
app.post('/plugin/healthcheck', (req, res) => {
  const { pluginId, fileId } = req.body;
  if (!pluginId || !fileId) {
    return res.status(400).json({ error: 'pluginId and fileId are required' });
  }
  
  pluginConnections[fileId] = {
    pluginId,
    lastSeen: new Date(),
    status: 'connected'
  };
  
  // メッセージキューを初期化
  if (!messageQueues[fileId]) {
    messageQueues[fileId] = [];
  }
  
  console.error(`Plugin ${pluginId} healthcheck successful for file ${fileId}`);
  res.json({ success: true });
});

// プラグインからのポーリングエンドポイント
app.get('/plugin/poll/:fileId/:pluginId', (req, res) => {
  const { fileId, pluginId } = req.params;
  
  console.error(`Polling request received from plugin ${pluginId} for file ${fileId}`);
  
  // 接続情報を更新
  if (pluginConnections[fileId]) {
    pluginConnections[fileId].lastSeen = new Date();
    pluginConnections[fileId].status = 'connected';
    console.error(`Updated existing connection for file ${fileId}`);
  } else {
    console.error(`Creating new connection for file ${fileId} with plugin ${pluginId}`);
    pluginConnections[fileId] = {
      pluginId,
      lastSeen: new Date(),
      status: 'connected'
    };
  }
  
  // キューからメッセージを取得して返す
  const messages = messageQueues[fileId] || [];
  console.error(`Queue status for file ${fileId}: ${messages.length} messages`);
  
  if (messages.length > 0) {
    console.error(`Returning ${messages.length} messages to plugin for file ${fileId}:`, JSON.stringify(messages, null, 2));
    
    // メッセージを返した後、キューをクリア
    messageQueues[fileId] = [];
    console.error(`Queue cleared for file ${fileId}`);
    
    // 明示的にメッセージを返す
    return res.json({ messages });
  }
  
  // メッセージがない場合は空の配列を返す
  console.error(`No messages for file ${fileId}, returning empty array`);
  return res.json({ messages: [] });
});

// サーバーの起動
server.listen(PORT, () => {
  console.error(`Plugin communication server running on port ${PORT}`);
});

interface FigmaUpdateParams {
  fileId: string;
  updates: Record<string, any>;
}

// プラグインに更新を送信する関数
async function sendUpdateToPlugin(fileId: string, updates: any): Promise<boolean> {
  try {
    console.error(`Sending update to plugin for file ${fileId}`);
    console.error(`Updates content:`, JSON.stringify(updates, null, 2));
    
    // プラグインが接続されているか確認
    const connection = pluginConnections[fileId];
    if (!connection) {
      console.error(`Error: No plugin connected for file ${fileId}`);
      return false;
    }
    
    console.error(`Connection found:`, connection);
    
    // メッセージをキューに追加
    if (!messageQueues[fileId]) {
      messageQueues[fileId] = [];
    }
    
    const newMessage = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'update',
      updates
    };
    
    messageQueues[fileId].push(newMessage);
    console.error(`Message added to queue for file ${fileId}`);
    console.error(`Queue length: ${messageQueues[fileId].length}`);
    console.error(`Queue content:`, JSON.stringify(messageQueues[fileId], null, 2));
    
    return true;
  } catch (error) {
    console.error('Error sending update to plugin:', error);
    return false;
  }
}

// 直接メッセージキューに追加する関数（MCPサーバーから呼び出し用）
function addToMessageQueue(fileId: string, updates: any): boolean {
  try {
    console.error(`Attempting to add message to queue for file ${fileId}`);
    
    // プラグインが接続されているか確認
    if (!pluginConnections[fileId]) {
      // 接続がない場合でもキューを作成しておく（後でプラグインが接続する可能性がある）
      console.error(`Warning: No plugin currently connected for file ${fileId}, but will queue message anyway`);
      
      // 接続情報を仮作成
      pluginConnections[fileId] = {
        pluginId: 'pending-connection',
        lastSeen: new Date(),
        status: 'pending'
      };
    } else {
      console.error(`Found existing connection for file ${fileId}: ${JSON.stringify(pluginConnections[fileId])}`);
    }
    
    // メッセージをキューに追加
    if (!messageQueues[fileId]) {
      messageQueues[fileId] = [];
    }
    
    const newMessage = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'update',
      updates
    };
    
    messageQueues[fileId].push(newMessage);
    console.error(`Message directly added to queue for file ${fileId}`);
    console.error(`Queue length: ${messageQueues[fileId].length}`);
    console.error(`Queue content: ${JSON.stringify(messageQueues[fileId], null, 2)}`);
    
    return true;
  } catch (error) {
    console.error('Error adding message to queue:', error);
    return false;
  }
}

class FigmaServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "figma-mcp-server",
      version: "0.1.0"
    }, {
      capabilities: {
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
    this.setupToolHandlers();
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
          console.error(`Received figma_update request for file ${fileId}`);
          
          // 直接メッセージキューに追加（HTTPリクエストを使用しない）
          const success = addToMessageQueue(fileId, updates);
          
          if (success) {
            console.error(`Successfully added update to message queue for file ${fileId}`);
            return {
              content: [{
                type: "text",
                text: `Update request sent to Figma plugin for file ${fileId}`
              }]
            };
          } else {
            console.error(`Failed to add update to message queue for file ${fileId}`);
            return {
              content: [{
                type: "text",
                text: `Warning: Could not find connected plugin for file ${fileId}. Please open the file in Figma and run the plugin first.`
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

// MCPサーバーの起動
const mcpServer = new FigmaServer();
mcpServer.run().catch(console.error); 
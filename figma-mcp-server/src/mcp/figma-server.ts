import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { FigmaUpdateParams } from '../types.js';
import { SERVER_NAME, SERVER_VERSION, TOOL_NAME, TOOL_DESCRIPTION } from '../config/index.js';
import { addToMessageQueue } from '../utils/message-queue.js';

/**
 * Figma MCPサーバークラス
 */
export class FigmaServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: SERVER_NAME,
      version: SERVER_VERSION
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * エラーハンドリングの設定
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * ハンドラーの設定
   */
  private setupHandlers(): void {
    this.setupToolHandlers();
  }

  /**
   * ツールハンドラーの設定
   */
  private setupToolHandlers(): void {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [{
          name: TOOL_NAME,
          description: TOOL_DESCRIPTION,
          inputSchema: {
            type: "object",
            properties: {
              fileId: {
                type: "string",
                description: "Figma file ID"
              },
              updates: {
                type: "array",
                description: "Multiple updates to apply in a single request",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["createFrame", "createText", "createRectangle", "createEllipse", "createLine", "createImage", "createComponent"]
                    },
                    data: {
                      type: "object"
                    }
                  },
                  required: ["type", "data"]
                }
              }
            }
          }
        }]
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        if (request.params.name !== TOOL_NAME) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        const params = request.params.arguments as unknown as FigmaUpdateParams;
        try {
          const { fileId, updates } = params;
          console.error(`Received figma_update request for file ${fileId}`);
          
          // メッセージキューに追加
          let success = false;
          
          if (updates && Array.isArray(updates)) {
            // 更新の処理
            console.error(`Processing updates with ${updates.length} items`);
            
            // テキスト要素のcontentパラメータをチェック
            for (const update of updates) {
              if (update.type === 'createText') {
                if (!update.data || !update.data.content) {
                  const errorMessage = `Error: Missing required parameter "content" for createText element "${update.data?.name || 'unnamed'}"`;
                  console.error(errorMessage);
                  return {
                    content: [{
                      type: "text",
                      text: errorMessage
                    }],
                    isError: true
                  };
                } else if (update.data.content === '') {
                  const errorMessage = `Error: Parameter "content" cannot be empty for createText element "${update.data.name || 'unnamed'}"`;
                  console.error(errorMessage);
                  return {
                    content: [{
                      type: "text",
                      text: errorMessage
                    }],
                    isError: true
                  };
                }
              }
            }
            
            // 更新をそのままキューに追加（変換せずに）
            success = addToMessageQueue(fileId, { updates });
          } else {
            console.error(`No valid updates found in request`);
            return {
              content: [{
                type: "text",
                text: `Error: No valid updates found in request`
              }],
              isError: true
            };
          }
          
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

  /**
   * サーバーの起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Figma MCP server running on stdio");
  }
} 
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
                type: "object",
                description: "Changes to apply to the file",
                properties: {
                  createFrame: {
                    type: "object",
                    description: "Create a frame",
                    properties: {
                      name: { type: "string" },
                      width: { type: "number" },
                      height: { type: "number" },
                      x: { type: "number" },
                      y: { type: "number" },
                      fills: { type: "array" },
                      cornerRadius: { type: "number" },
                      layoutMode: { type: "string", enum: ["NONE", "HORIZONTAL", "VERTICAL"] }
                    }
                  },
                  createText: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create a text element",
                        properties: {
                          name: { type: "string" },
                          content: { type: "string" },
                          fontSize: { type: "number" },
                          fontWeight: { type: "string" },
                          x: { type: "number" },
                          y: { type: "number" },
                          fills: { type: "array" }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple text elements",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            content: { type: "string" },
                            fontSize: { type: "number" },
                            fontWeight: { type: "string" },
                            x: { type: "number" },
                            y: { type: "number" },
                            fills: { type: "array" }
                          }
                        }
                      }
                    ]
                  },
                  createRectangle: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create a rectangle",
                        properties: {
                          name: { type: "string" },
                          width: { type: "number" },
                          height: { type: "number" },
                          x: { type: "number" },
                          y: { type: "number" },
                          fills: { type: "array" },
                          cornerRadius: { type: "number" },
                          strokes: { type: "array" },
                          strokeWeight: { type: "number" }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple rectangles",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            width: { type: "number" },
                            height: { type: "number" },
                            x: { type: "number" },
                            y: { type: "number" },
                            fills: { type: "array" },
                            cornerRadius: { type: "number" },
                            strokes: { type: "array" },
                            strokeWeight: { type: "number" }
                          }
                        }
                      }
                    ]
                  },
                  createEllipse: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create an ellipse",
                        properties: {
                          name: { type: "string" },
                          width: { type: "number" },
                          height: { type: "number" },
                          x: { type: "number" },
                          y: { type: "number" },
                          fills: { type: "array" },
                          strokes: { type: "array" },
                          strokeWeight: { type: "number" },
                          arcData: { type: "object" }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple ellipses",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            width: { type: "number" },
                            height: { type: "number" },
                            x: { type: "number" },
                            y: { type: "number" },
                            fills: { type: "array" },
                            strokes: { type: "array" },
                            strokeWeight: { type: "number" },
                            arcData: { type: "object" }
                          }
                        }
                      }
                    ]
                  },
                  createLine: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create a line",
                        properties: {
                          name: { type: "string" },
                          points: { type: "array" },
                          strokes: { type: "array" },
                          strokeWeight: { type: "number" },
                          strokeCap: { type: "string" }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple lines",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            points: { type: "array" },
                            strokes: { type: "array" },
                            strokeWeight: { type: "number" },
                            strokeCap: { type: "string" }
                          }
                        }
                      }
                    ]
                  },
                  createImage: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create an image",
                        properties: {
                          name: { type: "string" },
                          imageUrl: { type: "string" },
                          width: { type: "number" },
                          height: { type: "number" },
                          x: { type: "number" },
                          y: { type: "number" },
                          scaleMode: { type: "string", enum: ["FILL", "FIT", "CROP", "TILE"] }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple images",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            imageUrl: { type: "string" },
                            width: { type: "number" },
                            height: { type: "number" },
                            x: { type: "number" },
                            y: { type: "number" },
                            scaleMode: { type: "string", enum: ["FILL", "FIT", "CROP", "TILE"] }
                          }
                        }
                      }
                    ]
                  },
                  createComponent: {
                    oneOf: [
                      {
                        type: "object",
                        description: "Create a component",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          width: { type: "number" },
                          height: { type: "number" },
                          x: { type: "number" },
                          y: { type: "number" },
                          fills: { type: "array" },
                          strokes: { type: "array" },
                          strokeWeight: { type: "number" },
                          cornerRadius: { type: "number" }
                        }
                      },
                      {
                        type: "array",
                        description: "Create multiple components",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                            width: { type: "number" },
                            height: { type: "number" },
                            x: { type: "number" },
                            y: { type: "number" },
                            fills: { type: "array" },
                            strokes: { type: "array" },
                            strokeWeight: { type: "number" },
                            cornerRadius: { type: "number" }
                          }
                        }
                      }
                    ]
                  }
                }
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

  /**
   * サーバーの起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Figma MCP server running on stdio");
  }
} 
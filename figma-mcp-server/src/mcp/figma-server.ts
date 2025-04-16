import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import {
  SERVER_NAME,
  SERVER_VERSION,
  UPDATE_FILE_TOOL_NAME,
  UPDATE_FILE_TOOL_DESCRIPTION,
  GET_FILE_TOOL_NAME,
  GET_FILE_TOOL_DESCRIPTION,
  USAGE_TOOL_NAME,
  USAGE_TOOL_DESCRIPTION
} from '../config/index.js';
import { getToolHandler, toolUsageRegistry } from '../tools/index.js';

/**
 * Figma MCPサーバークラス
 */
export class FigmaServer {
  private server: Server;
  private isRunning: boolean = false;

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

    // 個別のSIGINTハンドラはここでは設定せず、index.tsで一元管理
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
    // ツール一覧のハンドラー
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
          // update_file ツール
          {
            name: UPDATE_FILE_TOOL_NAME,
            description: UPDATE_FILE_TOOL_DESCRIPTION,
            inputSchema: toolUsageRegistry["update_file"].inputSchema
          },
          // get_file ツール
          {
            name: GET_FILE_TOOL_NAME,
            description: GET_FILE_TOOL_DESCRIPTION,
            inputSchema: toolUsageRegistry["get_file"].inputSchema
          },
          // get_mcp_tool_usage ツール
          {
            name: USAGE_TOOL_NAME,
            description: USAGE_TOOL_DESCRIPTION,
            inputSchema: toolUsageRegistry["get_mcp_tool_usage"].inputSchema
          }
        ]
      })
    );

    // ツール呼び出しのハンドラー
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const toolName = request.params.name;
        const handler = getToolHandler(toolName);
        
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
        }
        
        return handler(request.params.arguments);
      }
    );
  }

  /**
   * サーバーの起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.isRunning = true;
    console.error("Figma MCP server running on stdio");
  }

  /**
   * サーバーのシャットダウン
   * 外部からサーバーを適切に終了するためのパブリックメソッド
   */
  async shutdown(): Promise<void> {
    if (this.isRunning) {
      await this.server.close();
      this.isRunning = false;
      console.error("Figma MCP server shut down");
    }
  }

  /**
   * サーバーの実行状態を取得
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }
}
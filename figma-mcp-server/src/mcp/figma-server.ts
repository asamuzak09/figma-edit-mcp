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
  USAGE_TOOL_NAME,
  USAGE_TOOL_DESCRIPTION
} from '../config/index.js';
import { getToolHandler, toolUsageRegistry } from '../tools/index.js';

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
    console.error("Figma MCP server running on stdio");
  }
}
// 環境変数からの設定
export const PORT = parseInt(process.env.PORT || '5678', 10);
export const FALLBACK_PORT = process.env.FALLBACK_PORT ? parseInt(process.env.FALLBACK_PORT, 10) : PORT + 1;
export const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

// サーバー設定
export const SERVER_NAME = "figma-mcp-server";
export const SERVER_VERSION = "0.1.0";

// ツール設定
export const UPDATE_FILE_TOOL_NAME = "update_file";
export const UPDATE_FILE_TOOL_DESCRIPTION = "Updates a Figma file with the specified changes";

// ファイル取得ツール設定
export const GET_FILE_TOOL_NAME = "get_file";
export const GET_FILE_TOOL_DESCRIPTION = "Retrieves the contents of a Figma file by its ID";

// 使い方取得ツール設定
export const USAGE_TOOL_NAME = "get_mcp_tool_usage";
export const USAGE_TOOL_DESCRIPTION = "Get detailed usage information, parameter descriptions, and sample code for MCP tools";
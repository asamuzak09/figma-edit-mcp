import { handleUpdateFileTool } from './update-file/index.js';
import { handleGetToolUsageTool } from './get-tool-usage/index.js';
import { UPDATE_FILE_TOOL_NAME, USAGE_TOOL_NAME } from '../config/index.js';

// ツールハンドラーの型定義
type ToolHandler = (params: any) => Promise<{
  content: { type: string; text: string }[];
  isError?: boolean;
}>;

/**
 * ツールハンドラーのマップ
 */
export const toolHandlers: Record<string, ToolHandler> = {
  [UPDATE_FILE_TOOL_NAME]: handleUpdateFileTool,
  [USAGE_TOOL_NAME]: handleGetToolUsageTool
};

/**
 * ツール名からハンドラーを取得する
 * @param toolName ツール名
 * @returns ツールハンドラー
 */
export function getToolHandler(toolName: string): ToolHandler | undefined {
  return toolHandlers[toolName];
}

// ツールレジストリをエクスポート
export * from './tool-registry.js';
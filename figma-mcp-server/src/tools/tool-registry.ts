import { ToolUsageInfo } from '../types.js';
import { updateFileMetadata } from './update-file/metadata.js';
import { getToolUsageMetadata } from './get-tool-usage/metadata.js';
import { getFileMetadata } from './get-file/metadata.js';

/**
 * 利用可能なツールの使用方法情報を定義
 */
export const toolUsageRegistry: Record<string, ToolUsageInfo> = {
  // update_file ツールの使用方法
  "update_file": updateFileMetadata,
  
  // get_file ツールの使用方法
  "get_file": getFileMetadata,
  
  // get_mcp_tool_usage ツールの使用方法
  "get_mcp_tool_usage": getToolUsageMetadata
};

/**
 * ツールの使用方法情報を取得する
 * @param toolName ツール名
 * @returns ツールの使用方法情報
 */
export function getToolUsageInfo(toolName: string): ToolUsageInfo | null {
  return toolUsageRegistry[toolName] || null;
}
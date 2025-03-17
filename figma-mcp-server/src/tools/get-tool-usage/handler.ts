import { GetMcpToolUsageParams } from '../../types.js';
import { getToolUsageInfo } from '../tool-registry.js';
import { formatToolUsageInfo } from './format-usage.js';

/**
 * get_mcp_tool_usage ツールのハンドラー
 * @param params ツールパラメータ
 * @returns ツールの実行結果
 */
export async function handleGetToolUsageTool(params: GetMcpToolUsageParams) {
  try {
    const { toolName } = params;
    
    // ツールの使用方法情報を取得
    const toolUsageInfo = getToolUsageInfo(toolName);
    
    if (!toolUsageInfo) {
      return {
        content: [{
          type: "text",
          text: `Error: Tool "${toolName}" not found or usage information not available.`
        }],
        isError: true
      };
    }
    
    // 使用方法情報をフォーマットして返す
    const formattedUsage = formatToolUsageInfo(toolUsageInfo);
    
    return {
      content: [{
        type: "text",
        text: formattedUsage
      }]
    };
  } catch (error) {
    console.error('Error processing get_mcp_tool_usage request:', error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
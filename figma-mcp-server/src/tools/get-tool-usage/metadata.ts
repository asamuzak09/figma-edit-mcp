import { ToolUsageInfo } from '../../types.js';
import { USAGE_TOOL_NAME, USAGE_TOOL_DESCRIPTION } from '../../config/index.js';

/**
 * get_mcp_tool_usage ツールの使用方法情報
 */
export const getToolUsageMetadata: ToolUsageInfo = {
  name: USAGE_TOOL_NAME,
  description: USAGE_TOOL_DESCRIPTION,
  inputSchema: {
    type: "object",
    properties: {
      toolName: {
        type: "string",
        description: "使用方法を取得したいツールの名前"
      }
    },
    required: ["toolName"]
  },
  examples: [
    {
      title: "update_file ツールの使用方法を取得",
      description: "update_file ツールの詳細な使用方法を取得する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>get_mcp_tool_usage</tool_name>
<arguments>
{
  "toolName": "update_file"
}
</arguments>
</use_mcp_tool>`
    }
  ]
};
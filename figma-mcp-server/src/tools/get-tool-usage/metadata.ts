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
        description: "Name of the tool for which to get usage information"
      }
    },
    required: ["toolName"]
  },
  examples: [
    {
      title: "Getting Usage Information for the update_file Tool",
      description: "Example of retrieving detailed usage information for the update_file tool",
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
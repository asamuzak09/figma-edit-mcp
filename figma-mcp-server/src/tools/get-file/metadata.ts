import { ToolUsageInfo } from '../../types.js';
import { GET_FILE_TOOL_NAME, GET_FILE_TOOL_DESCRIPTION } from '../../config/index.js';

/**
 * get_file ツールの使用方法情報
 */
export const getFileMetadata: ToolUsageInfo = {
  name: GET_FILE_TOOL_NAME,
  description: GET_FILE_TOOL_DESCRIPTION,
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "Figma file ID"
      },
      includeComponents: {
        type: "boolean",
        description: "Include components in the response",
        default: false
      },
      includeStyles: {
        type: "boolean",
        description: "Include styles in the response",
        default: false
      },
      includeNodes: {
        type: "array",
        description: "Specific node IDs to include in the response",
        items: {
          type: "string"
        }
      },
      depth: {
        type: "number",
        description: "Depth of the tree to retrieve (1-99)",
        minimum: 1,
        maximum: 99
      }
    },
    required: ["fileId"]
  },
  examples: [
    {
      title: "Basic File Retrieval",
      description: "Example of retrieving basic information from a Figma file",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>get_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID"
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "File Retrieval with Components and Styles",
      description: "Example of retrieving a Figma file including component and style information",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>get_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "includeComponents": true,
  "includeStyles": true
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "Retrieving Specific Nodes",
      description: "Example of retrieving specific parts of a Figma file by specifying node IDs",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>get_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "includeNodes": ["NODE_ID_1", "NODE_ID_2"]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "Limiting the Depth of Retrieved Hierarchy",
      description: "Example of limiting the depth of node hierarchy to retrieve",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>get_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "depth": 2
}
</arguments>
</use_mcp_tool>`
    }
  ],
  notes: [
    "The fileId parameter is required. You can get the Figma file ID from the Figma URL (e.g., the XXXXXXXXXXXX part in https://www.figma.com/file/XXXXXXXXXXXX/FileName).",
    "Setting includeComponents to true will include component information in the file.",
    "Setting includeStyles to true will include style information in the file.",
    "The includeNodes parameter allows you to retrieve only specific node IDs.",
    "The depth parameter allows you to limit the depth of the node hierarchy to retrieve.",
    "The response can be large, so it's recommended to retrieve only the information you need."
  ]
};
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
      title: "基本的なファイル取得",
      description: "Figmaファイルの基本情報を取得する例",
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
      title: "コンポーネントとスタイルを含むファイル取得",
      description: "コンポーネントとスタイル情報を含めてFigmaファイルを取得する例",
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
      title: "特定のノードを取得",
      description: "特定のノードIDを指定してFigmaファイルの一部を取得する例",
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
      title: "取得する階層の深さを制限",
      description: "取得するノード階層の深さを制限する例",
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
    "fileIdパラメータは必須です。FigmaファイルIDは、FigmaのURLから取得できます（例: https://www.figma.com/file/XXXXXXXXXXXX/FileName の XXXXXXXXXXXX 部分）。",
    "includeComponentsをtrueに設定すると、ファイル内のコンポーネント情報が含まれます。",
    "includeStylesをtrueに設定すると、ファイル内のスタイル情報が含まれます。",
    "includeNodesパラメータを使用すると、特定のノードIDのみを取得できます。",
    "depthパラメータを使用すると、取得するノード階層の深さを制限できます。",
    "レスポンスは大きくなる可能性があるため、必要な情報のみを取得することをお勧めします。"
  ]
};
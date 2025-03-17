import { ToolUsageInfo } from '../../types';
import { UPDATE_FILE_TOOL_NAME, UPDATE_FILE_TOOL_DESCRIPTION } from '../../config';

/**
 * update_file ツールの使用方法情報
 */
export const updateFileToolDocs: ToolUsageInfo = {
  name: UPDATE_FILE_TOOL_NAME,
  description: UPDATE_FILE_TOOL_DESCRIPTION,
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "Figma file ID"
      },
      updates: {
        type: "array",
        description: "Multiple updates to apply in a single request",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["createFrame", "createText", "createRectangle", "createEllipse", "createLine", "createImage", "createComponent"]
            },
            data: {
              type: "object"
            }
          },
          required: ["type", "data"]
        }
      }
    }
  },
  examples: [
    {
      title: "フレームの作成",
      description: "新しいフレームを作成する例（レイアウト設定付き）",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createFrame",
      "data": {
        "name": "フレーム名",
        "width": 400,
        "height": 300,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.9, "g": 0.9, "b": 0.9 }
          }
        ],
        "cornerRadius": 8,
        "x": 100,
        "y": 100,
        "layoutMode": "VERTICAL",
        "primaryAxisSizingMode": "AUTO",
        "counterAxisSizingMode": "AUTO",
        "itemSpacing": 10,
        "paddingLeft": 16,
        "paddingRight": 16,
        "paddingTop": 16,
        "paddingBottom": 16
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "テキスト要素の作成",
      description: "高度なテキスト書式設定を含むテキスト要素の作成例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createText",
      "data": {
        "name": "テキスト名",
        "content": "テキスト内容",
        "fontSize": 24,
        "fontWeight": "Bold",
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.1, "g": 0.1, "b": 0.1 }
          }
        ],
        "x": 100,
        "y": 100,
        "textAlignHorizontal": "CENTER",
        "textCase": "UPPER",
        "letterSpacing": 1.5
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "複数のテキスト要素の作成",
      description: "複数のテキスト要素を一度に作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createText",
      "data": {
        "name": "タイトル",
        "content": "見出し",
        "fontSize": 24,
        "fontWeight": "Bold",
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.1, "g": 0.1, "b": 0.1 }
          }
        ],
        "x": 100,
        "y": 100
      }
    },
    {
      "type": "createText",
      "data": {
        "name": "サブタイトル",
        "content": "サブ見出し",
        "fontSize": 18,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.3, "g": 0.3, "b": 0.3 }
          }
        ],
        "x": 100,
        "y": 140
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "矩形の作成",
      description: "ストローク（枠線）付きの矩形を作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createRectangle",
      "data": {
        "name": "矩形名",
        "width": 200,
        "height": 100,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.2, "g": 0.6, "b": 1.0 }
          }
        ],
        "cornerRadius": 8,
        "x": 100,
        "y": 100,
        "strokes": [
          {
            "type": "SOLID",
            "color": { "r": 0, "g": 0, "b": 0 }
          }
        ],
        "strokeWeight": 2
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "複数の矩形の作成",
      description: "異なる色の複数の矩形を作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createRectangle",
      "data": {
        "name": "青い矩形",
        "width": 200,
        "height": 100,
        "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.6, "b": 1.0 } }],
        "x": 100,
        "y": 100
      }
    },
    {
      "type": "createRectangle",
      "data": {
        "name": "赤い矩形",
        "width": 200,
        "height": 100,
        "fills": [{ "type": "SOLID", "color": { "r": 1.0, "g": 0.2, "b": 0.2 } }],
        "x": 100,
        "y": 220
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "楕円の作成",
      description: "ストローク（枠線）付きの楕円を作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createEllipse",
      "data": {
        "name": "楕円名",
        "width": 200,
        "height": 100,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 1.0, "g": 0.5, "b": 0.0 }
          }
        ],
        "x": 100,
        "y": 100,
        "strokes": [
          {
            "type": "SOLID",
            "color": { "r": 0, "g": 0, "b": 0 }
          }
        ],
        "strokeWeight": 2
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "線の作成",
      description: "矢印付きの線を作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createLine",
      "data": {
        "name": "線名",
        "points": [
          { "x": 100, "y": 100 },
          { "x": 200, "y": 200 }
        ],
        "strokes": [
          {
            "type": "SOLID",
            "color": { "r": 0, "g": 0, "b": 0 }
          }
        ],
        "strokeWeight": 2,
        "strokeCap": "ARROW_EQUILATERAL"
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "画像の挿入",
      description: "URLから画像を挿入する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createImage",
      "data": {
        "name": "画像名",
        "imageUrl": "https://example.com/image.jpg",
        "width": 300,
        "height": 200,
        "x": 100,
        "y": 100,
        "scaleMode": "FILL"
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "コンポーネントの作成",
      description: "再利用可能なコンポーネントを作成する例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createComponent",
      "data": {
        "name": "コンポーネント名",
        "description": "コンポーネントの説明",
        "width": 300,
        "height": 200,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0.9, "g": 0.9, "b": 0.9 }
          }
        ],
        "cornerRadius": 8,
        "x": 100,
        "y": 100
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "複合的なデザイン作成",
      description: "複数の要素タイプを組み合わせた複合的なデザインの例",
      code: `<use_mcp_tool>
<server_name>figma-mcp-server</server_name>
<tool_name>update_file</tool_name>
<arguments>
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "updates": [
    {
      "type": "createFrame",
      "data": {
        "name": "カード",
        "width": 300,
        "height": 400,
        "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
        "cornerRadius": 12,
        "x": 100,
        "y": 100,
        "effects": [
          {
            "type": "DROP_SHADOW",
            "color": { "r": 0, "g": 0, "b": 0, "a": 0.2 },
            "offset": { "x": 0, "y": 4 },
            "radius": 8
          }
        ]
      }
    },
    {
      "type": "createRectangle",
      "data": {
        "name": "ヘッダー",
        "width": 300,
        "height": 150,
        "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.6, "b": 1.0 } }],
        "x": 100,
        "y": 100,
        "cornerRadius": 12
      }
    },
    {
      "type": "createText",
      "data": {
        "name": "タイトル",
        "content": "プロダクトカード",
        "fontSize": 24,
        "fontWeight": "Bold",
        "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
        "x": 120,
        "y": 130
      }
    },
    {
      "type": "createText",
      "data": {
        "name": "説明",
        "content": "これは製品の詳細説明です。複数行にわたるテキストを表示できます。",
        "fontSize": 16,
        "fills": [{ "type": "SOLID", "color": { "r": 0.3, "g": 0.3, "b": 0.3 } }],
        "x": 120,
        "y": 270
      }
    },
    {
      "type": "createRectangle",
      "data": {
        "name": "ボタン",
        "width": 200,
        "height": 50,
        "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.8, "b": 0.4 } }],
        "x": 150,
        "y": 350,
        "cornerRadius": 25
      }
    },
    {
      "type": "createText",
      "data": {
        "name": "ボタンテキスト",
        "content": "購入する",
        "fontSize": 18,
        "fontWeight": "Bold",
        "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
        "x": 200,
        "y": 365
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    }
  ],
  notes: [
    "テキスト要素を作成する場合は、必ず `content` パラメータを指定してください。",
    "色の値は 0 から 1 の範囲で指定します（RGB各チャンネル）。",
    "フィグマファイルIDは、フィグマのURLから取得できます（例: https://www.figma.com/file/XXXXXXXXXXXX/FileName の XXXXXXXXXXXX 部分）。"
  ]
};
import { ToolUsageInfo } from '../../types.js';
import { UPDATE_FILE_TOOL_NAME, UPDATE_FILE_TOOL_DESCRIPTION } from '../../config/index.js';

/**
 * update_file ツールの使用方法情報
 */
export const updateFileMetadata: ToolUsageInfo = {
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
      title: "Creating a Frame",
      description: "Example of creating a new frame with layout settings",
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
        "name": "Frame Name",
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
      title: "Creating a Text Element",
      description: "Example of creating a text element with advanced formatting",
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
        "name": "Text Name",
        "characters": "Text Content",
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
        "width": 300,
        "textAutoResize": "HEIGHT",
        "textAlignHorizontal": "CENTER",
        "textCase": "UPPER",
        "letterSpacing": 1.5,
        "paragraphSpacing": 10,
        "lineHeight": { "value": 150, "unit": "PERCENT" }
      }
    }
  ]
}
</arguments>
</use_mcp_tool>`
    },
    {
      title: "Creating Multiple Text Elements",
      description: "Example of creating multiple text elements at once",
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
        "name": "Title",
        "characters": "Heading",
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
        "name": "Subtitle",
        "characters": "Subheading",
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
      title: "Creating a Rectangle",
      description: "Example of creating a rectangle with stroke",
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
        "name": "Rectangle Name",
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
      title: "Creating Multiple Rectangles",
      description: "Example of creating multiple rectangles with different colors",
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
        "name": "Blue Rectangle",
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
        "name": "Red Rectangle",
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
      title: "Creating an Ellipse",
      description: "Example of creating an ellipse with stroke",
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
        "name": "Ellipse Name",
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
      title: "Creating a Line",
      description: "Example of creating a line with arrow",
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
        "name": "Line Name",
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
      title: "Inserting an Image",
      description: "Example of inserting an image from URL",
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
        "name": "Image Name",
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
      title: "Creating a Component",
      description: "Example of creating a reusable component",
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
        "name": "Component Name",
        "description": "Component Description",
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
      title: "Creating a Complex Design",
      description: "Example of creating a complex design combining multiple element types",
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
        "name": "Card",
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
        "name": "Header",
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
        "name": "Title",
        "characters": "Product Card",
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
        "name": "Description",
        "characters": "This is a detailed product description. It can display text across multiple lines. For long text, you can specify the width and set the auto-resize mode to make the text wrap appropriately.",
        "fontSize": 16,
        "fills": [{ "type": "SOLID", "color": { "r": 0.3, "g": 0.3, "b": 0.3 } }],
        "x": 120,
        "y": 270,
        "width": 260,
        "textAutoResize": "HEIGHT",
        "lineHeight": { "value": 150, "unit": "PERCENT" },
        "paragraphSpacing": 10
      }
    },
    {
      "type": "createRectangle",
      "data": {
        "name": "Button",
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
        "name": "Button Text",
        "characters": "Buy Now",
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
    "When creating text elements, always specify the `characters` parameter.",
    "To properly size text boxes, use the `width` parameter and the `textAutoResize` parameter. For long text, specify `width` and set `textAutoResize` to 'HEIGHT' to make the text wrap appropriately.",
    "To adjust line spacing in text, use the `lineHeight` parameter. For `unit`, you can specify 'PIXELS' or 'PERCENT'.",
    "To set spacing between paragraphs, use the `paragraphSpacing` parameter.",
    "Color values are specified in the range from 0 to 1 (for each RGB channel).",
    "Figma file IDs can be obtained from the Figma URL (e.g., the XXXXXXXXXXXX part in https://www.figma.com/file/XXXXXXXXXXXX/FileName).",
    "The coordinate system has its origin (0,0) at the top left, and the position of all elements (rectangles, circles, etc.) is specified by coordinates from the top left corner. Note that for circular elements, the coordinates are from the top left corner, not the center."
  ]
};
# Figma Edit MCP

A tool for editing Figma files via MCP.
Add text, shapes, frames, and more through MCP.

## Requirements

- Node.js v20.0.0 or higher

## Installation

### Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/asamuzak09/figma-edit-mcp.git
cd figma-edit-mcp
```

2. **Install Dependencies**

```bash
npm run install-all
```

This command installs dependencies and runs the build in both the figma-mcp-server and figma-plugin directories.

3. **Install the Figma Plugin**

To install the Figma plugin locally in development mode:

1. Open the Figma desktop app
2. From the menu in the top right, select "Plugins" → "Development" → "Import plugin from manifest..."
3. Select the figma-plugin/manifest.json file
4. The plugin will be installed in development mode

### MCP Configuration

#### For Cline

To use this plugin with Cline, you need to add the MCP server configuration:

1. Add the following configuration to the `mcpServers` object:

```json
"figma-mcp-server": {
  "command": "node",
  "args": ["/path/to/figma-edit-mcp/figma-mcp-server/build/index.js"],
  "env": {
    "FIGMA_ACCESS_TOKEN": "your_figma_personal_access_token"
  }
}
```

#### For Cursor

To use this plugin with Cursor, you need to add the MCP server configuration:

1. Click "Add MCP Server"
2. Select "command" for "Type"
3. Enter the following for "Command":

```
env FIGMA_ACCESS_TOKEN=your_figma_personal_access_token node /path/to/figma-edit-mcp/figma-mcp-server/build/index.js
```

Replace `/path/to/figma-edit-mcp` with the actual path to the repository.
Replace `your_figma_personal_access_token` with your Figma Personal Access Token.

### How to Get a Figma Personal Access Token

1. Log in to Figma
2. Click on your profile icon in the top right
3. Select "Settings"
4. Go to the "Personal access tokens" section in the "Account" tab
5. Click "Create a new personal access token"
6. Enter a name for the token and click "Create token"
7. Copy the displayed token (note that this token will only be shown once)

## Usage

### Using the Figma Plugin

1. Open Figma
2. From the menu in the top right, select "Plugins" → "Development" → "Figma MCP Plugin"
3. The plugin will launch and connect to the MCP server

## Main Features

### Tools

- **update_file**: Tool to add and update elements in a Figma file
- **get_file**: Tool to retrieve the contents of a Figma file
- **get_mcp_tool_usage**: Tool to get usage information for MCP tools

### Element Types That Can Be Added with update_file

- **createFrame**: Create frames used as backgrounds or containers
- **createText**: Create text elements (titles, descriptions, etc.)
- **createRectangle**: Create rectangles (buttons, cards, etc.)
- **createEllipse**: Create ellipses (icons, decorations, etc.)
- **createLine**: Create lines (dividers, arrows, etc.)
- **createImage**: Insert images (logos, characters, etc.)
- **createComponent**: Create reusable components

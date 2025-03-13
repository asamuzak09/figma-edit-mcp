# Figma Edit MCP

Cursor と Figma を連携させるための MCP サーバーと Figma プラグインのセット。LLM を使用して Figma デザインを自動生成・編集できます。

## プロジェクト構成

- `figma-plugin/`: Figma プラグイン
- `figma-mcp-server/`: MCP サーバー

## セットアップ

### 前提条件

- Node.js 18 以上
- Figma デスクトップアプリ
- Cursor

### MCP サーバーのセットアップ

```bash
cd figma-mcp-server
npm install
npm run build
```

### Figma プラグインのセットアップ

```bash
cd figma-plugin
npm install
npm run build
```

Figma デスクトップアプリで、「Plugins」→「Development」→「Import plugin from manifest...」を選択し、`figma-plugin/manifest.json`ファイルを選択します。

## 使用方法

### MCP サーバーの起動

```bash
cd figma-mcp-server
FIGMA_ACCESS_TOKEN=your_figma_access_token node build/index.js
```

### Figma プラグインの実行

1. Figma でファイルを開く
2. メニューから「Plugins」→「Development」→「Cursor Figma Assistant」を選択
3. プラグイン UI で「Connect to MCP Server」ボタンをクリック

### Cursor からデザイン更新

Cursor のチャットで以下のようにツールを呼び出します：

```
/tool figma_update {
  "fileId": "your_figma_file_id",
  "updates": {
    "createFrame": {
      "name": "Generated Design",
      "width": 400,
      "height": 300,
      "fills": [{ "type": "SOLID", "color": { "r": 0.9, "g": 0.9, "b": 0.9 } }]
    },
    "createText": {
      "name": "Heading",
      "content": "Hello from Cursor!",
      "fontSize": 24,
      "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.1, "b": 0.1 } }]
    }
  }
}
```

## ライセンス

MIT

# Figma MCP Server

Cursor と Figma プラグインの間で通信を行う MCP サーバーです。

## 機能

- Cursor からの MCP リクエストの処理
- Figma プラグインとの通信
- メッセージキューの管理
- デザイン更新情報の配信

## 開発環境のセットアップ

1. 依存パッケージのインストール

```bash
npm install
```

2. 本番用ビルド

```bash
npm run build
```

3. サーバーの起動

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token node build/index.js
```

## 環境変数

- `PORT`: サーバーのポート番号（デフォルト: 3000）
- `FIGMA_ACCESS_TOKEN`: Figma API のアクセストークン（必須）

## API エンドポイント

### POST /plugin/register

Figma プラグインの登録を処理します。

リクエストボディ:

```json
{
  "pluginId": "string",
  "fileId": "string"
}
```

### GET /plugin/poll/:fileId/:pluginId

Figma プラグインからのポーリングリクエストを処理し、メッセージキューからメッセージを返します。

レスポンス:

```json
{
  "messages": [
    {
      "id": "number",
      "timestamp": "string",
      "type": "update",
      "updates": {}
    }
  ]
}
```

## MCP ツール

### figma_update

Figma ファイルの更新リクエストを処理します。

パラメータ:

```json
{
  "fileId": "string",
  "updates": {
    "createFrame": {
      "name": "string",
      "width": "number",
      "height": "number",
      "fills": [
        {
          "type": "SOLID",
          "color": { "r": "number", "g": "number", "b": "number" }
        }
      ],
      "x": "number",
      "y": "number"
    },
    "createText": {
      "name": "string",
      "content": "string",
      "fontSize": "number",
      "fontWeight": "string",
      "fills": [
        {
          "type": "SOLID",
          "color": { "r": "number", "g": "number", "b": "number" }
        }
      ],
      "x": "number",
      "y": "number"
    }
  }
}
```

`createText` は単一のオブジェクトまたはオブジェクトの配列として指定できます。

## 内部アーキテクチャ

サーバーは 2 つの主要コンポーネントで構成されています：

1. **HTTP サーバー（Express）**:

   - Figma プラグインとの通信を担当
   - プラグイン登録とポーリングリクエストを処理
   - メッセージキューを管理

2. **MCP サーバー（StdioServerTransport）**:
   - Cursor からの MCP リクエストを処理
   - `figma_update` ツールを提供
   - メッセージキューにデザイン更新情報を追加

## 技術スタック

- TypeScript
- Express
- Model Context Protocol (MCP)
- Node.js HTTP サーバー

# Figma MCP Server

Cursor と Figma プラグインの間で通信を行う MCP サーバーです。

## 機能

- Figma API との通信
- Cursor からのチャットメッセージの処理
- Figma ファイルの更新処理
- 環境変数による設定管理

## 開発環境のセットアップ

1. 依存パッケージのインストール

```bash
npm install
```

2. 開発モードでの起動

```bash
npm run dev
```

3. 本番用ビルド

```bash
npm run build
npm start
```

## 環境変数

- `PORT`: サーバーのポート番号（デフォルト: 3000）
- `FIGMA_ACCESS_TOKEN`: Figma API のアクセストークン

## API エンドポイント

### POST /api/figma/update

Figma ファイルの更新リクエストを処理します。

リクエストボディ:

```json
{
  "fileId": "string",
  "nodeId": "string",
  "updates": {}
}
```

### POST /api/chat

Cursor からのチャットメッセージを処理します。

リクエストボディ:

```json
{
  "message": "string",
  "fileId": "string"
}
```

## 技術スタック

- TypeScript
- Express
- Figma API
- dotenv

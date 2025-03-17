# Figma Edit MCP

Figma ファイルを MCP から編集するためのツール。
MCP 経由でテキストや図形、フレームなどを追加可能。

## 必要条件

- Node.js v20.0.0 以上

## インストレーション

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/asamuzak09/figma-edit-mcp.git
cd figma-edit-mcp
```

2. **依存関係のインストール**

```bash

npm run install-all
```

このコマンドは、figma-mcp-serverとfigma-pluginの両方のディレクトリで依存関係をインストールし、ビルドを実行します。

3. **Figma プラグインのインストール**

Figma プラグインをローカルで開発モードでインストールするには：

1. Figma デスクトップアプリを開く
2. 右上のメニューから「Plugins」→「Development」→「Import plugin from manifest...」を選択
3. figma-plugin/manifest.json ファイルを選択
4. プラグインが開発モードでインストールされます

### MCP の設定

#### Cline の場合

Cline でこのプラグインを使用するには、MCP サーバーの設定を追加する必要があります：

1. 以下の設定を`mcpServers`オブジェクトに追加:

```json
"figma-mcp-server": {
  "command": "node",
  "args": ["/path/to/figma-edit-mcp/figma-mcp-server/build/index.js"],
  "env": {
    "FIGMA_ACCESS_TOKEN": "your_figma_personal_access_token"
  }
}
```

#### Cursor の場合

Cursor でこのプラグインを使用するには、MCP サーバーの設定を追加する必要があります：

1. 「Add MCP Server」をクリック
2. 「Type」で「command」を選択
3. 「Command」に以下を入力:

```
env FIGMA_ACCESS_TOKEN=your_figma_personal_access_token node /path/to/figma-edit-mcp/figma-mcp-server/build/index.js
```

`/path/to/figma-edit-mcp`は、実際のリポジトリのパスに置き換えてください。
`your_figma_personal_access_token`は、Figma Personal Access Token を入れてください。

### Figma Personal Access Token の取得方法

1. Figma にログイン
2. 右上のプロフィールアイコンをクリック
3. 「Settings」を選択
4. 「Account」タブで「Personal access tokens」セクションに移動
5. 「Create a new personal access token」をクリック
6. トークン名を入力し、「Create token」をクリック
7. 表示されたトークンをコピー（このトークンは一度しか表示されないので注意）

## 使用方法

### Figma プラグインの使用

1. Figma を開く
2. 右上のメニューから「Plugins」→「Development」→「Figma MCP Plugin」を選択
3. プラグインが起動し、MCP サーバーに接続されます

## 主な機能

### ツール

- **update_file**: Figma ファイルに要素を追加・更新するツール
- **get_file**: Figma ファイルの内容を取得するツール
- **get_mcp_tool_usage**: MCP ツールの使用方法情報を取得するツール

### update_fileで追加可能な要素タイプ

- **createFrame**: 背景やコンテナとして使用するフレームを作成
- **createText**: テキスト要素を作成（タイトル、説明文など）
- **createRectangle**: 矩形を作成（ボタン、カードなど）
- **createEllipse**: 楕円を作成（アイコン、装飾など）
- **createLine**: 線を作成（区切り線、矢印など）
- **createImage**: 画像を挿入（ロゴ、キャラクターなど）
- **createComponent**: 再利用可能なコンポーネントを作成

# Figma MCP Plugin

Figma MCP（Model Context Protocol）プラグインは、Figmaファイルをプログラムで操作するためのツールです。このプラグインを使用することで、テキスト、図形、フレームなどの要素をFigmaファイルに追加したり、既存の要素を編集したりすることができます。

## 特徴

- **MCPサーバー連携**: Model Context Protocolを使用して、Figmaプラグインと通信
- **複数の要素タイプ**: フレーム、テキスト、矩形、楕円、線、画像、コンポーネントなどの作成をサポート
- **テキスト書式設定**: 高度なテキスト書式設定（フォントサイズ、行間、段落間隔など）をサポート
- **一括更新**: 複数の要素を一度のリクエストで作成可能

## インストレーション

### 前提条件

- Node.js (v14以上)
- npm (v6以上)
- Figmaアカウント
- Figma Personal Access Token

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/asamuzak09/figma-edit-mcp.git
cd figma-edit-mcp
```

2. **MCPサーバーのセットアップ**

```bash
# figma-mcp-serverディレクトリに移動
cd figma-mcp-server

# 依存関係のインストール
npm install

# 環境変数の設定
# .envファイルを作成し、Figma Personal Access Tokenを設定
echo "FIGMA_ACCESS_TOKEN=your_figma_personal_access_token" > .env

# ビルド
npm run build

# サーバーの起動
node build/index.js
```

Figma Personal Access Tokenの取得方法:
1. Figmaにログイン
2. 右上のプロフィールアイコンをクリック
3. 「Settings」を選択
4. 「Account」タブで「Personal access tokens」セクションに移動
5. 「Create a new personal access token」をクリック
6. トークン名を入力し、「Create token」をクリック
7. 表示されたトークンをコピー（このトークンは一度しか表示されないので注意）

3. **Figmaプラグインのセットアップ**

```bash
# figma-pluginディレクトリに移動
cd ../figma-plugin

# 依存関係のインストール
npm install

# ビルド
npm run build
```

4. **Figmaプラグインのインストール**

Figmaプラグインをローカルで開発モードでインストールするには：

1. Figmaを開く
2. 右上のメニューから「Plugins」→「Development」→「Import plugin from manifest...」を選択
3. figma-plugin/manifest.jsonファイルを選択
4. プラグインが開発モードでインストールされます

5. **Cline MCPの設定**

Clineでこのプラグインを使用するには、MCPサーバーの設定を追加する必要があります：

1. Clineの設定ファイルを開く:
   - macOS: `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%\Cursor\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`

2. 以下の設定を`mcpServers`オブジェクトに追加:

```json
"figma-mcp-server": {
  "command": "node",
  "args": ["/path/to/figma-edit-mcp/figma-mcp-server/build/index.js"],
  "env": {
    "FIGMA_ACCESS_TOKEN": "your_figma_personal_access_token"
  }
}
```

`/path/to/figma-edit-mcp`は、実際のリポジトリのパスに置き換えてください。

## 使用方法

### MCPサーバーの起動

```bash
cd figma-mcp-server
node build/index.js
```

### Figmaプラグインの使用

1. Figmaを開く
2. 右上のメニューから「Plugins」→「Development」→「Figma MCP Plugin」を選択
3. プラグインが起動し、MCPサーバーに接続されます

### Clineからの使用

Clineから以下のようにMCPツールを使用できます：

```
<use_mcp_tool>
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
        "characters": "テキスト内容",
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
        "lineHeight": { "value": 150, "unit": "PERCENT" }
      }
    }
  ]
}
</arguments>
</use_mcp_tool>
```

`YOUR_FIGMA_FILE_ID`は、操作したいFigmaファイルのIDに置き換えてください。FigmaファイルIDは、FigmaのURLから取得できます（例: https://www.figma.com/file/XXXXXXXXXXXX/FileName のXXXXXXXXXXXX部分）。

## 主な機能

### 要素タイプ

- **createFrame**: 背景やコンテナとして使用するフレームを作成
- **createText**: テキスト要素を作成（タイトル、説明文など）
- **createRectangle**: 矩形を作成（ボタン、カードなど）
- **createEllipse**: 楕円を作成（アイコン、装飾など）
- **createLine**: 線を作成（区切り線、矢印など）
- **createImage**: 画像を挿入（ロゴ、キャラクターなど）
- **createComponent**: 再利用可能なコンポーネントを作成

### テキスト要素の設定

テキストボックスのサイズを適切に設定するには、以下のパラメータを使用します：

```json
{
  "width": 300,                      // テキストボックスの幅
  "textAutoResize": "HEIGHT",        // 高さのみ自動調整
  "lineHeight": {                    // 行の高さ
    "value": 150,
    "unit": "PERCENT"
  },
  "paragraphSpacing": 10             // 段落間の間隔
}
```

## 注意事項

- 色の値は0から1の範囲で指定（RGB各チャンネル）
- 座標系は左上を原点（0,0）とし、すべての要素の位置は左上隅からの座標で指定
- テキスト要素を作成する場合は、必ず `characters` パラメータを指定
- 長いテキストの場合は、`width` を指定して `textAutoResize` を 'HEIGHT' に設定することで、テキストが適切に折り返される

## トラブルシューティング

### MCPサーバーに接続できない場合

1. MCPサーバーが起動しているか確認
2. Figma Personal Access Tokenが正しく設定されているか確認
3. ポート5678が他のアプリケーションで使用されていないか確認

### プラグインがFigmaに表示されない場合

1. プラグインが正しくインストールされているか確認
2. manifest.jsonファイルが正しく設定されているか確認
3. Figmaを再起動

### テキストが途中で切れる場合

1. `width` パラメータを指定
2. `textAutoResize` パラメータを 'HEIGHT' に設定
3. 必要に応じて `lineHeight` と `paragraphSpacing` パラメータを調整
# Figma MCP Integration

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

#### 複数のテキスト要素を一度に作成

`createText`は配列形式にも対応しています：

```
/tool figma_update {
  "fileId": "your_figma_file_id",
  "updates": {
    "createFrame": {
      "name": "Multiple Texts Frame",
      "width": 400,
      "height": 300,
      "fills": [{ "type": "SOLID", "color": { "r": 0.9, "g": 0.9, "b": 0.9 } }]
    },
    "createText": [
      {
        "name": "Heading",
        "content": "Main Title",
        "fontSize": 24,
        "fontWeight": "Bold",
        "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.1, "b": 0.1 } }],
        "x": 20,
        "y": 20
      },
      {
        "name": "Subtitle",
        "content": "This is a subtitle",
        "fontSize": 16,
        "fills": [{ "type": "SOLID", "color": { "r": 0.3, "g": 0.3, "b": 0.3 } }],
        "x": 20,
        "y": 60
      }
    ]
  }
}
```

## 技術詳細

### 通信フロー

1. **MCP サーバー**：

   - Cursor からの `figma_update` ツールリクエストを受け取る
   - メッセージキューにデザイン更新情報を追加

2. **Figma プラグイン**：
   - 起動時に MCP サーバーに登録
   - 定期的にポーリングしてメッセージを取得
   - 取得したメッセージに基づいて Figma デザインを更新

### サポートされる更新タイプ

- **createFrame**: フレームの作成

  - name: フレーム名
  - width/height: サイズ
  - fills: 塗りつぶし
  - x/y: 位置

- **createText**: テキスト要素の作成（単一または配列）
  - name: テキスト要素名
  - content: テキスト内容
  - fontSize: フォントサイズ
  - fontWeight: フォントの太さ（"Bold"または"Regular"）
  - fills: 塗りつぶし
  - x/y: 位置

## トラブルシューティング

- **プラグインが接続できない場合**：

  - MCP サーバーが起動しているか確認
  - ポート 3000 が他のアプリケーションで使用されていないか確認
  - ブラウザの CORS ポリシーが原因の場合は、Figma デスクトップアプリを使用

- **デザイン更新が反映されない場合**：
  - プラグインのログでエラーメッセージを確認
  - MCP サーバーのログでメッセージキューの状態を確認
  - プラグインを再起動して再接続

## ライセンス

MIT

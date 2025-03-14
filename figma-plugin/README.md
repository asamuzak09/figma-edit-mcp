# Cursor Figma Assistant

Cursor と Figma を連携させるためのプラグインです。MCP サーバーを介して Cursor からの指示に基づいて Figma ファイルを編集できます。

## 機能

- MCP サーバーとの接続
- メッセージのポーリングによる更新情報の取得
- フレームの作成
- テキスト要素の作成（単一または複数）
- デバッグログの表示

## 開発環境のセットアップ

1. 依存パッケージのインストール

```bash
npm install
```

2. 本番用ビルド

```bash
npm run build
```

## Figma へのインポート方法

1. Figma デスクトップアプリを開く
2. メニューから「Plugins」→「Development」→「Import plugin from manifest...」を選択
3. このプロジェクトの`manifest.json`を選択

## 使用方法

1. MCP サーバーを起動
2. Figma でプラグインを起動
3. プラグイン UI で「Connect to MCP Server」ボタンをクリックして接続を確立
4. Cursor から MCP サーバーに更新リクエストを送信
5. プラグインが自動的に更新を適用

## サポートされる更新タイプ

### createFrame

フレームを作成します。

```json
{
  "name": "Frame Name",
  "width": 400,
  "height": 300,
  "fills": [{ "type": "SOLID", "color": { "r": 0.9, "g": 0.9, "b": 0.9 } }],
  "x": 100,
  "y": 100
}
```

### createText

テキスト要素を作成します。単一のオブジェクトまたはオブジェクトの配列として指定できます。

```json
{
  "name": "Text Name",
  "content": "Hello World",
  "fontSize": 24,
  "fontWeight": "Bold",
  "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.1, "b": 0.1 } }],
  "x": 120,
  "y": 120
}
```

**注意**: `content`パラメータは必須です。このパラメータがない場合、エラーが返されます。

または配列形式：

```json
[
  {
    "name": "Heading",
    "content": "Main Title",
    "fontSize": 24,
    "fontWeight": "Bold",
    "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.1, "b": 0.1 } }],
    "x": 120,
    "y": 120
  },
  {
    "name": "Subtitle",
    "content": "This is a subtitle",
    "fontSize": 16,
    "fills": [{ "type": "SOLID", "color": { "r": 0.3, "g": 0.3, "b": 0.3 } }],
    "x": 120,
    "y": 160
  }
]
```

## デバッグ

プラグイン UI にはデバッグログが表示されます。エラーが発生した場合は、このログを確認してください。

## 技術スタック

- TypeScript
- Figma Plugin API
- esbuild

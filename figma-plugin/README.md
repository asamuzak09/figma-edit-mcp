# Cursor Figma Assistant

Cursor と Figma を連携させるためのプラグインです。Cursor でのチャット内容に基づいて Figma ファイルを編集できます。

## 機能

- Cursor からのチャットメッセージに基づく Figma ファイルの編集
- 編集状態のリアルタイム表示
- エラー発生時のフィードバック表示

## 開発環境のセットアップ

1. 依存パッケージのインストール

```bash
npm install
```

2. 開発モードでのビルド

```bash
npm run watch
```

3. 本番用ビルド

```bash
npm run build
```

## Figma へのインポート方法

1. Figma デスクトップアプリを開く
2. メニューから「Plugins」→「Development」→「Import plugin from manifest...」を選択
3. このプロジェクトの`manifest.json`を選択

## 使用方法

1. Figma でプラグインを起動
2. Cursor でチャットメッセージを送信
3. プラグインの UI で編集状態を確認

## 技術スタック

- TypeScript
- Figma Plugin API
- esbuild

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// MCPサーバーとの通信設定
const MCP_SERVER_URL = 'http://localhost:3000';
const POLLING_INTERVAL = 2000; // 2秒ごとにポーリング
// プラグインの初期化
figma.showUI(__html__, { width: 300, height: 400 });
// プラグインIDとファイルIDを取得
const pluginId = figma.root.getPluginData('pluginId') || Math.random().toString(36).substring(2, 15);
const fileId = figma.fileKey;
// プラグインIDを保存
figma.root.setPluginData('pluginId', pluginId);
// MCPサーバーに登録
function registerWithMCPServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${MCP_SERVER_URL}/plugin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pluginId,
                    fileId
                })
            });
            const data = yield response.json();
            if (data.success) {
                figma.ui.postMessage({ type: 'registration-success', fileId });
                console.log('Registered with MCP server');
                startPolling();
            }
            else {
                figma.ui.postMessage({ type: 'registration-error', error: data.error });
                console.error('Failed to register with MCP server:', data.error);
            }
        }
        catch (error) {
            figma.ui.postMessage({ type: 'registration-error', error: String(error) });
            console.error('Error registering with MCP server:', error);
        }
    });
}
// MCPサーバーからのメッセージをポーリング
let pollingInterval = null;
function startPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${MCP_SERVER_URL}/plugin/poll/${fileId}/${pluginId}`);
            const data = yield response.json();
            if (data.messages && data.messages.length > 0) {
                for (const message of data.messages) {
                    handleMessage(message);
                }
            }
        }
        catch (error) {
            console.error('Error polling MCP server:', error);
        }
    }), POLLING_INTERVAL);
}
// MCPサーバーからのメッセージを処理
function handleMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Received message from MCP server:', message);
        figma.ui.postMessage({ type: 'mcp-message', message });
        if (message.type === 'update') {
            yield applyUpdates(message.updates);
        }
    });
}
// 更新を適用
function applyUpdates(updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ここでFigmaファイルを更新する処理を実装
            // 例: レイヤーの作成、スタイルの変更など
            // 例: 新しいフレームを作成
            if (updates.createFrame) {
                const frame = figma.createFrame();
                frame.name = updates.createFrame.name || 'New Frame';
                frame.resize(updates.createFrame.width || 100, updates.createFrame.height || 100);
                if (updates.createFrame.fills) {
                    frame.fills = updates.createFrame.fills;
                }
                figma.currentPage.appendChild(frame);
            }
            // 例: テキストを作成
            if (updates.createText) {
                const text = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                text.characters = updates.createText.content || 'New Text';
                text.name = updates.createText.name || 'Text Layer';
                if (updates.createText.fontSize) {
                    text.fontSize = updates.createText.fontSize;
                }
                if (updates.createText.fills) {
                    text.fills = updates.createText.fills;
                }
                figma.currentPage.appendChild(text);
            }
            // 例: 既存のノードを更新
            if (updates.updateNode && updates.updateNode.id) {
                const node = figma.getNodeById(updates.updateNode.id);
                if (node) {
                    if (updates.updateNode.name) {
                        node.name = updates.updateNode.name;
                    }
                    // SceneNodeのみvisibleプロパティを持つ
                    if ('visible' in updates.updateNode && 'visible' in node) {
                        node.visible = updates.updateNode.visible;
                    }
                    // 他のプロパティも同様に更新
                }
            }
            figma.ui.postMessage({ type: 'update-success', updates });
        }
        catch (error) {
            console.error('Error applying updates:', error);
            figma.ui.postMessage({ type: 'update-error', error: String(error) });
        }
    });
}
// UIからのメッセージを処理
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'register') {
        yield registerWithMCPServer();
    }
    else if (msg.type === 'cancel') {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        figma.closePlugin();
    }
});
// 初期化時に登録を実行
registerWithMCPServer();

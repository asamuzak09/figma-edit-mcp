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
const MCP_SERVER_URL = 'http://localhost:5678';
const POLLING_INTERVAL = 1000; // 1秒ごとにポーリング
const DEBUG = true; // デバッグモード
// デバッグ用関数
function debug(...args) {
    if (DEBUG) {
        console.log('[FIGMA-PLUGIN]', ...args);
        try {
            figma.ui.postMessage({
                type: 'debug',
                message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
            });
        }
        catch (e) {
            console.error('Error sending debug message to UI:', e);
        }
    }
}
// プラグインの初期化
figma.showUI(__html__, { width: 300, height: 400 });
// フォントの読み込み状態を追跡
let fontsLoaded = false;
// よく使用するフォントを事前に読み込む
Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
]).then(() => {
    debug('Fonts preloaded successfully');
    fontsLoaded = true;
    // フォントの読み込みが完了したら、サーバーに接続
    healthcheckWithServer();
}).catch(error => {
    debug('Error preloading fonts:', error);
    // エラーが発生しても接続は試みる
    healthcheckWithServer();
});
// プラグインIDとファイルIDを取得
const pluginId = figma.root.getPluginData('pluginId') || `plugin-${Date.now()}`;
const fileId = figma.fileKey || `local-file-${Date.now()}`;
// プラグインIDを保存
figma.root.setPluginData('pluginId', pluginId);
// ポーリング間隔の管理
let pollingInterval = null;
// ポーリングを開始する関数
function startPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        yield pollForMessages();
    }), POLLING_INTERVAL);
}
// MCPサーバーにプラグインを登録
function healthcheckWithServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            debug('Connecting to MCP server...');
            const response = yield fetch(`${MCP_SERVER_URL}/plugin/healthcheck`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pluginId,
                    fileId,
                }),
            });
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            const data = yield response.json();
            debug('Connection successful:', data);
            figma.ui.postMessage({ type: 'log', message: `Connected to MCP server with file ID: ${fileId}` });
            figma.ui.postMessage({ type: 'connection-success', fileId });
            // 接続成功後、ポーリングを開始
            startPolling();
        }
        catch (error) {
            console.error('Failed to connect to MCP server:', error);
            debug('Connection error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            figma.ui.postMessage({ type: 'error', message: `Failed to connect to MCP server: ${errorMessage}` });
            figma.ui.postMessage({ type: 'connection-error', error: errorMessage });
        }
    });
}
// MCPサーバーからメッセージをポーリング
function pollForMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            debug('Polling for messages...');
            const response = yield fetch(`${MCP_SERVER_URL}/plugin/poll/${fileId}/${pluginId}`);
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            const data = yield response.json();
            debug('Poll response:', data);
            if (data.messages && data.messages.length > 0) {
                debug(`Received ${data.messages.length} messages`);
                debug(`Messages content:`, JSON.stringify(data.messages, null, 2));
                // メッセージを処理
                for (const message of data.messages) {
                    debug('Processing message:', message);
                    if (message.type === 'update') {
                        debug('Update message found, applying updates:', message.updates);
                        yield applyUpdates(message.updates);
                    }
                    else {
                        debug('Unknown message type:', message.type);
                    }
                }
            }
            else {
                // No messages
            }
        }
        catch (error) {
            console.error('Failed to poll for messages:', error);
            debug('Polling error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            figma.ui.postMessage({ type: 'error', message: `Failed to poll for messages: ${errorMessage}` });
        }
    });
}
// Figmaデザインに更新を適用
function applyUpdates(updates) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('Applying updates:', updates);
        try {
            // フレーム作成
            if (updates.createFrame) {
                const { name, width, height, fills, x, y, cornerRadius, layoutMode, primaryAxisSizingMode, counterAxisSizingMode, paddingLeft, paddingRight, paddingTop, paddingBottom, itemSpacing, strokes, strokeWeight, strokeAlign, opacity, effects, visible } = updates.createFrame;
                const frame = figma.createFrame();
                frame.name = name || 'New Frame';
                frame.resize(width || 100, height || 100);
                // 位置の設定
                if (x !== undefined)
                    frame.x = x;
                if (y !== undefined)
                    frame.y = y;
                // 塗りつぶしの設定
                if (fills && Array.isArray(fills)) {
                    try {
                        frame.fills = fills;
                    }
                    catch (e) {
                        debug('Error setting fills:', e);
                    }
                }
                // 角丸の設定
                if (cornerRadius !== undefined)
                    frame.cornerRadius = cornerRadius;
                // レイアウトモードの設定
                if (layoutMode) {
                    frame.layoutMode = layoutMode;
                    if (primaryAxisSizingMode)
                        frame.primaryAxisSizingMode = primaryAxisSizingMode;
                    if (counterAxisSizingMode)
                        frame.counterAxisSizingMode = counterAxisSizingMode;
                    if (paddingLeft !== undefined)
                        frame.paddingLeft = paddingLeft;
                    if (paddingRight !== undefined)
                        frame.paddingRight = paddingRight;
                    if (paddingTop !== undefined)
                        frame.paddingTop = paddingTop;
                    if (paddingBottom !== undefined)
                        frame.paddingBottom = paddingBottom;
                    if (itemSpacing !== undefined)
                        frame.itemSpacing = itemSpacing;
                }
                // ストロークの設定
                if (strokes && Array.isArray(strokes)) {
                    try {
                        frame.strokes = strokes;
                    }
                    catch (e) {
                        debug('Error setting strokes:', e);
                    }
                }
                if (strokeWeight !== undefined)
                    frame.strokeWeight = strokeWeight;
                if (strokeAlign)
                    frame.strokeAlign = strokeAlign;
                // 透明度の設定
                if (opacity !== undefined)
                    frame.opacity = opacity;
                // エフェクトの設定
                if (effects && Array.isArray(effects)) {
                    try {
                        frame.effects = effects;
                    }
                    catch (e) {
                        debug('Error setting effects:', e);
                    }
                }
                // 表示/非表示の設定
                if (visible !== undefined)
                    frame.visible = visible;
                // 現在のページに追加
                figma.currentPage.appendChild(frame);
                debug('Frame created:', { name: frame.name, id: frame.id });
                // ビューポートを新しいフレームに移動
                figma.viewport.scrollAndZoomIntoView([frame]);
            }
            // テキスト要素の作成
            if (updates.createText) {
                if (Array.isArray(updates.createText)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of text elements:', updates.createText.length);
                    yield Promise.all(updates.createText.map((textData, index) => createTextElement(textData, index)));
                }
                else {
                    // 単一のオブジェクトの場合
                    yield createTextElement(updates.createText);
                }
            }
            // 矩形の作成
            if (updates.createRectangle) {
                if (Array.isArray(updates.createRectangle)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of rectangles:', updates.createRectangle.length);
                    yield Promise.all(updates.createRectangle.map((rectData, index) => createRectangleElement(rectData, index)));
                }
                else {
                    // 単一のオブジェクトの場合
                    yield createRectangleElement(updates.createRectangle);
                }
            }
            // 楕円の作成
            if (updates.createEllipse) {
                if (Array.isArray(updates.createEllipse)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of ellipses:', updates.createEllipse.length);
                    yield Promise.all(updates.createEllipse.map((ellipseData, index) => createEllipseElement(ellipseData, index)));
                }
                else {
                    // 単一のオブジェクトの場合
                    yield createEllipseElement(updates.createEllipse);
                }
            }
            // 線の作成
            if (updates.createLine) {
                if (Array.isArray(updates.createLine)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of lines:', updates.createLine.length);
                    updates.createLine.forEach((lineData, index) => {
                        createLineElement(lineData, index);
                    });
                }
                else {
                    // 単一のオブジェクトの場合
                    createLineElement(updates.createLine);
                }
            }
            // 画像の挿入
            if (updates.createImage) {
                if (Array.isArray(updates.createImage)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of images:', updates.createImage.length);
                    updates.createImage.forEach((imageData, index) => {
                        createImageElement(imageData, index);
                    });
                }
                else {
                    // 単一のオブジェクトの場合
                    createImageElement(updates.createImage);
                }
            }
            // コンポーネントの作成
            if (updates.createComponent) {
                if (Array.isArray(updates.createComponent)) {
                    // 配列の場合は各要素を処理
                    debug('Processing array of components:', updates.createComponent.length);
                    updates.createComponent.forEach((componentData, index) => {
                        createComponentElement(componentData, index);
                    });
                }
                else {
                    // 単一のオブジェクトの場合
                    createComponentElement(updates.createComponent);
                }
            }
            debug('Updates applied successfully');
            figma.ui.postMessage({ type: 'log', message: 'デザインを更新しました' });
            figma.notify('デザインを更新しました');
        }
        catch (error) {
            console.error('Failed to apply updates:', error);
            debug('Update application error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            figma.ui.postMessage({ type: 'error', message: `Failed to apply updates: ${errorMessage}` });
            figma.notify('デザイン更新中にエラーが発生しました', { error: true });
        }
    });
}
// テキスト要素を作成する関数
function createTextElement(textData, index) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, content, fontSize, fills, x, y, fontWeight } = textData;
            const text = figma.createText();
            text.name = name || `New Text ${index !== undefined ? index + 1 : ''}`;
            // 位置の設定
            if (x !== undefined)
                text.x = x;
            if (y !== undefined)
                text.y = y;
            // フォントの読み込みを待機（awaitを使用して同期的に処理）
            const fontStyle = fontWeight === 'Bold' ? 'Bold' : 'Regular';
            try {
                // 常にフォントを読み込む（キャッシュされていれば高速に完了する）
                debug('Loading font:', { family: "Inter", style: fontStyle });
                yield figma.loadFontAsync({ family: "Inter", style: fontStyle });
                // フォントが読み込まれた後にテキストを設定
                text.characters = content || 'Hello World';
                if (fontSize)
                    text.fontSize = fontSize;
                if (fontWeight === 'Bold')
                    text.fontName = { family: "Inter", style: "Bold" };
                // 塗りつぶしの設定
                if (fills && Array.isArray(fills)) {
                    try {
                        const solidFills = fills;
                        text.fills = solidFills;
                    }
                    catch (e) {
                        debug('Error setting text fills:', e);
                    }
                }
                // 現在のページに追加
                figma.currentPage.appendChild(text);
                debug('Text created:', { name: text.name, id: text.id, content: text.characters });
                resolve();
            }
            catch (e) {
                debug('Error loading font:', e);
                reject(e);
            }
        }
        catch (error) {
            debug('Error creating text element:', error);
            reject(error);
        }
    }));
}
// 矩形を作成する関数
function createRectangleElement(rectData, index) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, width, height, fills, strokes, strokeWeight, strokeAlign, cornerRadius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius, x, y, opacity, effects, visible } = rectData;
            const rect = figma.createRectangle();
            rect.name = name || `Rectangle ${index !== undefined ? index + 1 : ''}`;
            rect.resize(width || 100, height || 100);
            // 位置の設定
            if (x !== undefined)
                rect.x = x;
            if (y !== undefined)
                rect.y = y;
            // 塗りつぶしの設定
            if (fills && Array.isArray(fills)) {
                try {
                    rect.fills = fills;
                }
                catch (e) {
                    debug('Error setting fills:', e);
                }
            }
            // ストロークの設定
            if (strokes && Array.isArray(strokes)) {
                try {
                    rect.strokes = strokes;
                }
                catch (e) {
                    debug('Error setting strokes:', e);
                }
            }
            if (strokeWeight !== undefined)
                rect.strokeWeight = strokeWeight;
            if (strokeAlign)
                rect.strokeAlign = strokeAlign;
            // 角丸の設定
            if (cornerRadius !== undefined) {
                rect.cornerRadius = cornerRadius;
            }
            else {
                // 個別の角丸を設定
                if (topLeftRadius !== undefined)
                    rect.topLeftRadius = topLeftRadius;
                if (topRightRadius !== undefined)
                    rect.topRightRadius = topRightRadius;
                if (bottomLeftRadius !== undefined)
                    rect.bottomLeftRadius = bottomLeftRadius;
                if (bottomRightRadius !== undefined)
                    rect.bottomRightRadius = bottomRightRadius;
            }
            // 透明度の設定
            if (opacity !== undefined)
                rect.opacity = opacity;
            // エフェクトの設定
            if (effects && Array.isArray(effects)) {
                try {
                    rect.effects = effects;
                }
                catch (e) {
                    debug('Error setting effects:', e);
                }
            }
            // 表示/非表示の設定
            if (visible !== undefined)
                rect.visible = visible;
            // 現在のページに追加
            figma.currentPage.appendChild(rect);
            debug('Rectangle created:', { name: rect.name, id: rect.id });
            resolve(rect);
        }
        catch (error) {
            debug('Error creating rectangle:', error);
            reject(error);
        }
    }));
}
// 楕円を作成する関数
function createEllipseElement(ellipseData, index) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, width, height, fills, strokes, strokeWeight, strokeAlign, arcData, x, y, opacity, effects, visible } = ellipseData;
            const ellipse = figma.createEllipse();
            ellipse.name = name || `Ellipse ${index !== undefined ? index + 1 : ''}`;
            ellipse.resize(width || 100, height || 100);
            // 位置の設定
            if (x !== undefined)
                ellipse.x = x;
            if (y !== undefined)
                ellipse.y = y;
            // 塗りつぶしの設定
            if (fills && Array.isArray(fills)) {
                try {
                    ellipse.fills = fills;
                }
                catch (e) {
                    debug('Error setting fills:', e);
                }
            }
            // ストロークの設定
            if (strokes && Array.isArray(strokes)) {
                try {
                    ellipse.strokes = strokes;
                }
                catch (e) {
                    debug('Error setting strokes:', e);
                }
            }
            if (strokeWeight !== undefined)
                ellipse.strokeWeight = strokeWeight;
            if (strokeAlign)
                ellipse.strokeAlign = strokeAlign;
            // 弧データの設定
            if (arcData) {
                ellipse.arcData = arcData;
            }
            // 透明度の設定
            if (opacity !== undefined)
                ellipse.opacity = opacity;
            // エフェクトの設定
            if (effects && Array.isArray(effects)) {
                try {
                    ellipse.effects = effects;
                }
                catch (e) {
                    debug('Error setting effects:', e);
                }
            }
            // 表示/非表示の設定
            if (visible !== undefined)
                ellipse.visible = visible;
            // 現在のページに追加
            figma.currentPage.appendChild(ellipse);
            debug('Ellipse created:', { name: ellipse.name, id: ellipse.id });
            resolve(ellipse);
        }
        catch (error) {
            debug('Error creating ellipse:', error);
            reject(error);
        }
    }));
}
// 線を作成する関数
function createLineElement(lineData, index) {
    const { name, strokes, strokeWeight, strokeCap, points, opacity, effects, visible } = lineData;
    if (!points || points.length < 2) {
        debug('Error: Line requires at least 2 points');
        return null;
    }
    // 線の始点と終点
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    // 線を作成（実際にはベクターネットワークを使用）
    const line = figma.createLine();
    line.name = name || `Line ${index !== undefined ? index + 1 : ''}`;
    // 始点と終点を設定
    line.x = startPoint.x;
    line.y = startPoint.y;
    line.resize(Math.abs(endPoint.x - startPoint.x) || 1, Math.abs(endPoint.y - startPoint.y) || 1);
    // ストロークの設定
    if (strokes && Array.isArray(strokes)) {
        try {
            line.strokes = strokes;
        }
        catch (e) {
            debug('Error setting strokes:', e);
        }
    }
    else {
        // デフォルトのストローク
        line.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    }
    if (strokeWeight !== undefined)
        line.strokeWeight = strokeWeight;
    if (strokeCap)
        line.strokeCap = strokeCap;
    // 透明度の設定
    if (opacity !== undefined)
        line.opacity = opacity;
    // エフェクトの設定
    if (effects && Array.isArray(effects)) {
        try {
            line.effects = effects;
        }
        catch (e) {
            debug('Error setting effects:', e);
        }
    }
    // 表示/非表示の設定
    if (visible !== undefined)
        line.visible = visible;
    // 現在のページに追加
    figma.currentPage.appendChild(line);
    debug('Line created:', { name: line.name, id: line.id });
    return line;
}
// 画像の挿入
function createImageElement(imageData, index) {
    const { name, imageUrl, width, height, scaleMode, x, y, opacity, effects, visible } = imageData;
    // 画像を挿入するためのRectangleを作成
    const rect = figma.createRectangle();
    rect.name = name || `Image ${index !== undefined ? index + 1 : ''}`;
    rect.resize(width || 100, height || 100);
    // 位置の設定
    if (x !== undefined)
        rect.x = x;
    if (y !== undefined)
        rect.y = y;
    // 画像URLからFigmaで使用できる画像を取得（非同期処理）
    figma.createImageAsync(imageUrl)
        .then(image => {
        // 画像を塗りつぶしとして設定
        const imageFill = {
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: scaleMode || 'FILL'
        };
        rect.fills = [imageFill];
        // 透明度の設定
        if (opacity !== undefined)
            rect.opacity = opacity;
        // エフェクトの設定
        if (effects && Array.isArray(effects)) {
            try {
                rect.effects = effects;
            }
            catch (e) {
                debug('Error setting effects:', e);
            }
        }
        // 表示/非表示の設定
        if (visible !== undefined)
            rect.visible = visible;
        debug('Image created:', { name: rect.name, id: rect.id });
    })
        .catch(error => {
        debug('Error creating image:', error);
        // エラー時は赤い矩形を表示
        rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    });
    // 現在のページに追加
    figma.currentPage.appendChild(rect);
    return rect;
}
// コンポーネントの作成
function createComponentElement(componentData, index) {
    const { name, description, x, y, width, height, fills, strokes, strokeWeight, strokeAlign, cornerRadius, opacity, effects, visible } = componentData;
    const component = figma.createComponent();
    component.name = name || `Component ${index !== undefined ? index + 1 : ''}`;
    if (description) {
        component.description = description;
    }
    component.resize(width || 100, height || 100);
    // 位置の設定
    if (x !== undefined)
        component.x = x;
    if (y !== undefined)
        component.y = y;
    // 塗りつぶしの設定
    if (fills && Array.isArray(fills)) {
        try {
            component.fills = fills;
        }
        catch (e) {
            debug('Error setting fills:', e);
        }
    }
    // ストロークの設定
    if (strokes && Array.isArray(strokes)) {
        try {
            component.strokes = strokes;
        }
        catch (e) {
            debug('Error setting strokes:', e);
        }
    }
    if (strokeWeight !== undefined)
        component.strokeWeight = strokeWeight;
    if (strokeAlign)
        component.strokeAlign = strokeAlign;
    // 角丸の設定
    if (cornerRadius !== undefined)
        component.cornerRadius = cornerRadius;
    // 透明度の設定
    if (opacity !== undefined)
        component.opacity = opacity;
    // エフェクトの設定
    if (effects && Array.isArray(effects)) {
        try {
            component.effects = effects;
        }
        catch (e) {
            debug('Error setting effects:', e);
        }
    }
    // 表示/非表示の設定
    if (visible !== undefined)
        component.visible = visible;
    // 現在のページに追加
    figma.currentPage.appendChild(component);
    debug('Component created:', { name: component.name, id: component.id });
    return component;
}
// UIからのメッセージを処理
figma.ui.onmessage = (msg) => {
    if (msg.type === 'register') {
        healthcheckWithServer();
    }
    else if (msg.type === 'cancel') {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        figma.closePlugin();
    }
};
// 初期化時の接続はフォントの読み込み完了後に行うため、ここでは実行しない
// healthcheckWithServer(); 

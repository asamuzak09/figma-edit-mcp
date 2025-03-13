// MCPサーバーとの通信設定
const MCP_SERVER_URL = 'http://localhost:3000';
const POLLING_INTERVAL = 1000; // 1秒ごとにポーリング
const DEBUG = true; // デバッグモード

// デバッグ用関数
function debug(...args: any[]) {
  if (DEBUG) {
    console.log('[FIGMA-PLUGIN]', ...args);
    try {
      figma.ui.postMessage({ 
        type: 'debug', 
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ') 
      });
    } catch (e) {
      console.error('Error sending debug message to UI:', e);
    }
  }
}

// プラグインの初期化
figma.showUI(__html__, { width: 300, height: 400 });

// プラグインIDとファイルIDを取得
const pluginId = figma.root.getPluginData('pluginId') || `plugin-${Date.now()}`;
const fileId = figma.fileKey || `local-file-${Date.now()}`;

// プラグインIDを保存
figma.root.setPluginData('pluginId', pluginId);

// ポーリング間隔の管理
let pollingInterval: number | null = null;

// ポーリングを開始する関数
function startPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  pollingInterval = setInterval(async () => {
    await pollForMessages();
  }, POLLING_INTERVAL) as unknown as number;
}

// MCPサーバーにプラグインを登録
async function registerWithServer() {
  try {
    debug('Registering with MCP server...');
    const response = await fetch(`${MCP_SERVER_URL}/plugin/register`, {
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

    const data = await response.json();
    debug('Registration successful:', data);
    figma.ui.postMessage({ type: 'log', message: `Connected to MCP server with file ID: ${fileId}` });
    
    // 登録成功後、ポーリングを開始
    startPolling();
  } catch (error: unknown) {
    console.error('Failed to register with MCP server:', error);
    debug('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'error', message: `Failed to connect to MCP server: ${errorMessage}` });
  }
}

// MCPサーバーからメッセージをポーリング
async function pollForMessages() {
  try {
    debug('Polling for messages...');
    const response = await fetch(`${MCP_SERVER_URL}/plugin/poll/${fileId}/${pluginId}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    debug('Poll response:', data);
    
    if (data.messages && data.messages.length > 0) {
      debug(`Received ${data.messages.length} messages`);
      debug(`Messages content:`, JSON.stringify(data.messages, null, 2));
      
      // メッセージを処理
      data.messages.forEach((message: any) => {
        debug('Processing message:', message);
        if (message.type === 'update') {
          debug('Update message found, applying updates:', message.updates);
          applyUpdates(message.updates);
        } else {
          debug('Unknown message type:', message.type);
        }
      });
    } else {
      // No messages
    }
  } catch (error: unknown) {
    console.error('Failed to poll for messages:', error);
    debug('Polling error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'error', message: `Failed to poll for messages: ${errorMessage}` });
  }
}

// Figmaデザインに更新を適用
function applyUpdates(updates: any) {
  debug('Applying updates:', updates);
  try {
    // フレーム作成
    if (updates.createFrame) {
      const { name, width, height, fills, x, y } = updates.createFrame;
      const frame = figma.createFrame();
      frame.name = name || 'New Frame';
      frame.resize(width || 100, height || 100);
      
      // 位置の設定
      if (x !== undefined) frame.x = x;
      if (y !== undefined) frame.y = y;
      
      // 塗りつぶしの設定
      if (fills && Array.isArray(fills)) {
        try {
          const solidFills = fills as SolidPaint[];
          frame.fills = solidFills;
        } catch (e) {
          debug('Error setting fills:', e);
        }
      }
      
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
        updates.createText.forEach((textData: {
          name?: string;
          content?: string;
          fontSize?: number;
          fills?: SolidPaint[];
          x?: number;
          y?: number;
          fontWeight?: string;
        }, index: number) => {
          createTextElement(textData, index);
        });
      } else {
        // 単一のオブジェクトの場合
        createTextElement(updates.createText);
      }
    }
    
    debug('Updates applied successfully');
    figma.ui.postMessage({ type: 'log', message: 'デザインを更新しました' });
    figma.notify('デザインを更新しました');
  } catch (error: unknown) {
    console.error('Failed to apply updates:', error);
    debug('Update application error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'error', message: `Failed to apply updates: ${errorMessage}` });
    figma.notify('デザイン更新中にエラーが発生しました', { error: true });
  }
}

// テキスト要素を作成する関数
function createTextElement(textData: {
  name?: string;
  content?: string;
  fontSize?: number;
  fills?: SolidPaint[];
  x?: number;
  y?: number;
  fontWeight?: string;
}, index?: number) {
  const { name, content, fontSize, fills, x, y, fontWeight } = textData;
  const text = figma.createText();
  text.name = name || `New Text ${index !== undefined ? index + 1 : ''}`;
  
  // 位置の設定
  if (x !== undefined) text.x = x;
  if (y !== undefined) text.y = y;
  
  // フォントの読み込みを待機
  const fontStyle = fontWeight === 'Bold' ? 'Bold' : 'Regular';
  figma.loadFontAsync({ family: "Inter", style: fontStyle })
    .then(() => {
      text.characters = content || 'Hello World';
      if (fontSize) text.fontSize = fontSize;
      if (fontWeight === 'Bold') text.fontName = { family: "Inter", style: "Bold" };
      
      // 塗りつぶしの設定
      if (fills && Array.isArray(fills)) {
        try {
          const solidFills = fills as SolidPaint[];
          text.fills = solidFills;
        } catch (e) {
          debug('Error setting text fills:', e);
        }
      }
      
      // 現在のページに追加
      figma.currentPage.appendChild(text);
      debug('Text created:', { name: text.name, id: text.id, content: text.characters });
    })
    .catch(e => {
      debug('Error loading font:', e);
    });
}

// UIからのメッセージを処理
figma.ui.onmessage = (msg) => {
  if (msg.type === 'register') {
    registerWithServer();
  } else if (msg.type === 'cancel') {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    figma.closePlugin();
  }
};

// 初期化時に登録を実行
registerWithServer(); 
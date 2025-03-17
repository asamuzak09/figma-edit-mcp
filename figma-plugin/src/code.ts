// MCPサーバーとの通信設定
const MCP_SERVER_URL = 'http://localhost:5678';
const POLLING_INTERVAL = 1000; // 1秒ごとにポーリング
const DEBUG = false; // デバッグモードを無効化

// ログ出力関数（UIに必要なログのみ）
function logToUI(message: string, type: 'log' | 'error' = 'log') {
  try {
    figma.ui.postMessage({
      type: type === 'error' ? 'error' : 'log',
      message: message
    });
  } catch (e) {
    console.error('Error sending message to UI:', e);
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
  logToUI('フォントの読み込みが完了しました');
  fontsLoaded = true;
  // フォントの読み込みが完了したら、サーバーに接続
  healthcheckWithServer();
}).catch(error => {
  console.error('Error preloading fonts:', error);
  logToUI('フォントの読み込みに失敗しましたが、接続を試みます', 'error');
  // エラーが発生しても接続は試みる
  healthcheckWithServer();
});

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
async function healthcheckWithServer() {
  try {
    logToUI('MCPサーバーに接続しています...');
    const response = await fetch(`${MCP_SERVER_URL}/plugin/healthcheck`, {
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
    logToUI(`MCPサーバーに接続しました (ファイルID: ${fileId})`);
    figma.ui.postMessage({ type: 'connection-success', fileId });
    
    // 接続成功後、ポーリングを開始
    startPolling();
  } catch (error: unknown) {
    console.error('Failed to connect to MCP server:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    logToUI(`MCPサーバーへの接続に失敗しました: ${errorMessage}`, 'error');
    figma.ui.postMessage({ type: 'connection-error', error: errorMessage });
  }
}

// MCPサーバーからメッセージをポーリング
async function pollForMessages() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/plugin/poll/${fileId}/${pluginId}`);
    if (!response.ok) {
      console.error(`Error polling for messages: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    if (data && data.messages && data.messages.length > 0) {
      // 各メッセージを処理
      for (const message of data.messages) {
        if (message.type === 'update') {
          try {
            // 更新を適用
            await applyUpdates(message.updates);
          } catch (error) {
            console.error('Error applying updates:', error);
            logToUI('更新の適用中にエラーが発生しました', 'error');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error polling for messages:', error);
  }
}

// Figmaデザインに更新を適用
async function applyUpdates(updates: any) {
  try {
    // 更新の処理
    if (updates && updates.updates && Array.isArray(updates.updates)) {
      // MCPサーバーから送られてくる形式（updates.updatesの形式）
      // 各更新を処理
      for (const update of updates.updates) {
        const { type, data } = update;
        if (!type || !data) continue;
        
        // 一時的なupdatesオブジェクトを作成
        const tempUpdates = { [type]: data };
        await processUpdates(tempUpdates);
      }
    } else if (Array.isArray(updates)) {
      // 配列形式の場合（互換性のため）
      // 各更新を処理
      for (const update of updates) {
        const { type, data } = update;
        if (!type || !data) continue;
        
        // 一時的なupdatesオブジェクトを作成
        const tempUpdates = { [type]: data };
        await processUpdates(tempUpdates);
      }
    } else {
      // 旧形式の更新（互換性のため）
      await processUpdates(updates);
    }
    
    logToUI('デザインを更新しました');
    figma.notify('デザインを更新しました');
  } catch (error: unknown) {
    console.error('Failed to apply updates:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    logToUI(`更新の適用に失敗しました: ${errorMessage}`, 'error');
    figma.notify('デザイン更新中にエラーが発生しました', { error: true });
  }
}

// 更新を処理する関数
async function processUpdates(updates: any) {
  // フレーム作成
  if (updates.createFrame) {
    const { name, width, height, fills, x, y, cornerRadius, layoutMode, primaryAxisSizingMode, 
      counterAxisSizingMode, paddingLeft, paddingRight, paddingTop, paddingBottom, itemSpacing,
      strokes, strokeWeight, strokeAlign, opacity, effects, visible } = updates.createFrame;
      
    const frame = figma.createFrame();
    frame.name = name || 'New Frame';
    frame.resize(width || 100, height || 100);
    
    // 位置の設定
    if (x !== undefined) frame.x = x;
    if (y !== undefined) frame.y = y;
    
    // 塗りつぶしの設定
    if (fills && Array.isArray(fills)) {
      try {
        frame.fills = fills as Paint[];
      } catch (e) {
        console.error('Error setting fills:', e);
      }
    }
    
    // 角丸の設定
    if (cornerRadius !== undefined) frame.cornerRadius = cornerRadius;
    
    // レイアウトモードの設定
    if (layoutMode) {
      frame.layoutMode = layoutMode as 'NONE' | 'HORIZONTAL' | 'VERTICAL';
      
      if (primaryAxisSizingMode) frame.primaryAxisSizingMode = primaryAxisSizingMode as 'FIXED' | 'AUTO';
      if (counterAxisSizingMode) frame.counterAxisSizingMode = counterAxisSizingMode as 'FIXED' | 'AUTO';
      
      if (paddingLeft !== undefined) frame.paddingLeft = paddingLeft;
      if (paddingRight !== undefined) frame.paddingRight = paddingRight;
      if (paddingTop !== undefined) frame.paddingTop = paddingTop;
      if (paddingBottom !== undefined) frame.paddingBottom = paddingBottom;
      
      if (itemSpacing !== undefined) frame.itemSpacing = itemSpacing;
    }
    
    // ストロークの設定
    if (strokes && Array.isArray(strokes)) {
      try {
        frame.strokes = strokes as Paint[];
      } catch (e) {
        console.error('Error setting strokes:', e);
      }
    }
    
    if (strokeWeight !== undefined) frame.strokeWeight = strokeWeight;
    if (strokeAlign) frame.strokeAlign = strokeAlign as 'INSIDE' | 'OUTSIDE' | 'CENTER';
    
    // 透明度の設定
    if (opacity !== undefined) frame.opacity = opacity;
    
    // エフェクトの設定
    if (effects && Array.isArray(effects)) {
      try {
        frame.effects = effects as Effect[];
      } catch (e) {
        console.error('Error setting effects:', e);
      }
    }
    
    // 表示/非表示の設定
    if (visible !== undefined) frame.visible = visible;
    
    // 現在のページに追加
    figma.currentPage.appendChild(frame);
    
    // ビューポートを新しいフレームに移動
    figma.viewport.scrollAndZoomIntoView([frame]);
  }
  
  // テキスト要素の作成
  if (updates.createText) {
    if (Array.isArray(updates.createText)) {
      // 配列の場合は各要素を処理
      await Promise.all(updates.createText.map((textData: any, index: number) => createTextElement(textData, index)));
    } else {
      // 単一のオブジェクトの場合
      await createTextElement(updates.createText);
    }
  }
  
  // 矩形の作成
  if (updates.createRectangle) {
    if (Array.isArray(updates.createRectangle)) {
      // 配列の場合は各要素を処理
      await Promise.all(updates.createRectangle.map((rectData: any, index: number) => 
        createRectangleElement(rectData, index)
      ));
    } else {
      // 単一のオブジェクトの場合
      await createRectangleElement(updates.createRectangle);
    }
  }
  
  // 楕円の作成
  if (updates.createEllipse) {
    if (Array.isArray(updates.createEllipse)) {
      // 配列の場合は各要素を処理
      await Promise.all(updates.createEllipse.map((ellipseData: any, index: number) => 
        createEllipseElement(ellipseData, index)
      ));
    } else {
      // 単一のオブジェクトの場合
      await createEllipseElement(updates.createEllipse);
    }
  }
  
  // 線の作成
  if (updates.createLine) {
    if (Array.isArray(updates.createLine)) {
      // 配列の場合は各要素を処理
      updates.createLine.forEach((lineData: any, index: number) => {
        createLineElement(lineData, index);
      });
    } else {
      // 単一のオブジェクトの場合
      createLineElement(updates.createLine);
    }
  }
  
  // 画像の挿入
  if (updates.createImage) {
    if (Array.isArray(updates.createImage)) {
      // 配列の場合は各要素を処理
      updates.createImage.forEach((imageData: any, index: number) => {
        createImageElement(imageData, index);
      });
    } else {
      // 単一のオブジェクトの場合
      createImageElement(updates.createImage);
    }
  }
  
  // コンポーネントの作成
  if (updates.createComponent) {
    if (Array.isArray(updates.createComponent)) {
      // 配列の場合は各要素を処理
      updates.createComponent.forEach((componentData: any, index: number) => {
        createComponentElement(componentData, index);
      });
    } else {
      // 単一のオブジェクトの場合
      createComponentElement(updates.createComponent);
    }
  }
}

// テキスト要素を作成する関数
function createTextElement(textData: {
  name?: string;
  characters?: string;
  fontSize?: number;
  fills?: SolidPaint[];
  x?: number;
  y?: number;
  fontWeight?: string;
  width?: number;
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT';
  paragraphSpacing?: number;
  lineHeight?: { value: number; unit: 'PIXELS' | 'PERCENT' };
}, index?: number) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // charactersパラメータがない場合はエラーを返す
      if (!textData.characters) {
        const error = new Error("Property 'characters' is required for text elements");
        logToUI('テキスト要素の作成に失敗しました: charactersパラメータが必要です', 'error');
        figma.notify('テキスト要素の作成に失敗しました: charactersパラメータが必要です', { error: true });
        reject(error);
        return;
      }
const { name, characters, fontSize, fills, x, y, fontWeight, width, textAutoResize, paragraphSpacing, lineHeight } = textData;
const text = figma.createText();
text.name = name || `New Text ${index !== undefined ? index + 1 : ''}`;

// 位置の設定
if (x !== undefined) text.x = x;
if (y !== undefined) text.y = y;

// フォントの読み込みを待機（awaitを使用して同期的に処理）
const fontStyle = fontWeight === 'Bold' ? 'Bold' : 'Regular';

try {
  // 常にフォントを読み込む（キャッシュされていれば高速に完了する）
  await figma.loadFontAsync({ family: "Inter", style: fontStyle });
  
  // フォントが読み込まれた後にテキストを設定
  text.characters = characters;
  if (fontSize) text.fontSize = fontSize;
  if (fontWeight === 'Bold') text.fontName = { family: "Inter", style: "Bold" };
  
  // テキストの自動リサイズモードを設定
  if (textAutoResize) {
    text.textAutoResize = textAutoResize;
  } else {
    // デフォルトでは幅固定で高さ自動調整
    text.textAutoResize = 'HEIGHT';
  }
  
  // 幅が指定されている場合は設定
  if (width) {
    text.resize(width, text.height);
  } else if (characters.length > 20) {
    // 長いテキストの場合はデフォルトの幅を設定
    text.resize(300, text.height);
  }
  
  // 段落間隔の設定
  if (paragraphSpacing !== undefined) {
    text.paragraphSpacing = paragraphSpacing;
  }
  
  // 行の高さの設定
  if (lineHeight) {
    text.lineHeight = lineHeight;
  }
        
        // 塗りつぶしの設定
        if (fills && Array.isArray(fills)) {
          try {
            const solidFills = fills as SolidPaint[];
            text.fills = solidFills;
          } catch (e) {
            console.error('Error setting text fills:', e);
          }
        }
        
        // 現在のページに追加
        figma.currentPage.appendChild(text);
        resolve();
      } catch (e) {
        console.error('Error loading font:', e);
        reject(e);
      }
    } catch (error) {
      console.error('Error creating text element:', error);
      reject(error);
    }
  });
}

// 矩形を作成する関数
function createRectangleElement(rectData: {
  name?: string;
  width?: number;
  height?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  x?: number;
  y?: number;
  opacity?: number;
  effects?: Effect[];
  visible?: boolean;
}, index?: number) {
  return new Promise<SceneNode>(async (resolve, reject) => {
    try {
      const { 
        name, width, height, fills, strokes, strokeWeight, strokeAlign,
        cornerRadius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius,
        x, y, opacity, effects, visible
      } = rectData;
      
      const rect = figma.createRectangle();
      rect.name = name || `Rectangle ${index !== undefined ? index + 1 : ''}`;
      rect.resize(width || 100, height || 100);
      
      // 位置の設定
      if (x !== undefined) rect.x = x;
      if (y !== undefined) rect.y = y;
      
      // 塗りつぶしの設定
      if (fills && Array.isArray(fills)) {
        try {
          rect.fills = fills as Paint[];
        } catch (e) {
          console.error('Error setting fills:', e);
        }
      }
      
      // ストロークの設定
      if (strokes && Array.isArray(strokes)) {
        try {
          rect.strokes = strokes as Paint[];
        } catch (e) {
          console.error('Error setting strokes:', e);
        }
      }
      
      if (strokeWeight !== undefined) rect.strokeWeight = strokeWeight;
      if (strokeAlign) rect.strokeAlign = strokeAlign;
      
      // 角丸の設定
      if (cornerRadius !== undefined) {
        rect.cornerRadius = cornerRadius;
      } else {
        // 個別の角丸を設定
        if (topLeftRadius !== undefined) rect.topLeftRadius = topLeftRadius;
        if (topRightRadius !== undefined) rect.topRightRadius = topRightRadius;
        if (bottomLeftRadius !== undefined) rect.bottomLeftRadius = bottomLeftRadius;
        if (bottomRightRadius !== undefined) rect.bottomRightRadius = bottomRightRadius;
      }
      
      // 透明度の設定
      if (opacity !== undefined) rect.opacity = opacity;
      
      // エフェクトの設定
      if (effects && Array.isArray(effects)) {
        try {
          rect.effects = effects as Effect[];
        } catch (e) {
          console.error('Error setting effects:', e);
        }
      }
      
      // 表示/非表示の設定
      if (visible !== undefined) rect.visible = visible;
      
      // 現在のページに追加
      figma.currentPage.appendChild(rect);
      
      resolve(rect);
    } catch (error) {
      console.error('Error creating rectangle:', error);
      reject(error);
    }
  });
}

// 楕円を作成する関数
function createEllipseElement(ellipseData: {
  name?: string;
  width?: number;
  height?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  arcData?: { startingAngle: number; endingAngle: number; innerRadius: number };
  x?: number;
  y?: number;
  opacity?: number;
  effects?: Effect[];
  visible?: boolean;
}, index?: number) {
  return new Promise<SceneNode>(async (resolve, reject) => {
    try {
      const { 
        name, width, height, fills, strokes, strokeWeight, strokeAlign,
        arcData, x, y, opacity, effects, visible
      } = ellipseData;
      
      const ellipse = figma.createEllipse();
      ellipse.name = name || `Ellipse ${index !== undefined ? index + 1 : ''}`;
      ellipse.resize(width || 100, height || 100);
      
      // 位置の設定
      if (x !== undefined) ellipse.x = x;
      if (y !== undefined) ellipse.y = y;
      
      // 塗りつぶしの設定
      if (fills && Array.isArray(fills)) {
        try {
          ellipse.fills = fills as Paint[];
        } catch (e) {
          console.error('Error setting fills:', e);
        }
      }
      
      // ストロークの設定
      if (strokes && Array.isArray(strokes)) {
        try {
          ellipse.strokes = strokes as Paint[];
        } catch (e) {
          console.error('Error setting strokes:', e);
        }
      }
      
      if (strokeWeight !== undefined) ellipse.strokeWeight = strokeWeight;
      if (strokeAlign) ellipse.strokeAlign = strokeAlign;
      
      // 弧データの設定
      if (arcData) {
        ellipse.arcData = arcData;
      }
      
      // 透明度の設定
      if (opacity !== undefined) ellipse.opacity = opacity;
      
      // エフェクトの設定
      if (effects && Array.isArray(effects)) {
        try {
          ellipse.effects = effects as Effect[];
        } catch (e) {
          console.error('Error setting effects:', e);
        }
      }
      
      // 表示/非表示の設定
      if (visible !== undefined) ellipse.visible = visible;
      
      // 現在のページに追加
      figma.currentPage.appendChild(ellipse);
      
      resolve(ellipse);
    } catch (error) {
      console.error('Error creating ellipse:', error);
      reject(error);
    }
  });
}

// 線を作成する関数
function createLineElement(lineData: {
  name?: string;
  strokes?: Paint[];
  strokeWeight?: number;
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
  points: { x: number; y: number }[];
  opacity?: number;
  effects?: Effect[];
  visible?: boolean;
}, index?: number) {
  const { 
    name, strokes, strokeWeight, strokeCap, points,
    opacity, effects, visible
  } = lineData;
  
  if (!points || points.length < 2) {
    console.error('Error: Line requires at least 2 points');
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
  line.resize(
    Math.abs(endPoint.x - startPoint.x) || 1,
    Math.abs(endPoint.y - startPoint.y) || 1
  );
  
  // ストロークの設定
  if (strokes && Array.isArray(strokes)) {
    try {
      line.strokes = strokes as Paint[];
    } catch (e) {
      console.error('Error setting strokes:', e);
    }
  } else {
    // デフォルトのストローク
    line.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  }
  
  if (strokeWeight !== undefined) line.strokeWeight = strokeWeight;
  if (strokeCap) line.strokeCap = strokeCap;
  
  // 透明度の設定
  if (opacity !== undefined) line.opacity = opacity;
  
  // エフェクトの設定
  if (effects && Array.isArray(effects)) {
    try {
      line.effects = effects as Effect[];
    } catch (e) {
      console.error('Error setting effects:', e);
    }
  }
  
  // 表示/非表示の設定
  if (visible !== undefined) line.visible = visible;
  
  // 現在のページに追加
  figma.currentPage.appendChild(line);
  
  return line;
}

// 画像の挿入
function createImageElement(imageData: {
  name?: string;
  imageUrl: string;
  width?: number;
  height?: number;
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  x?: number;
  y?: number;
  opacity?: number;
  effects?: Effect[];
  visible?: boolean;
}, index?: number) {
  const { name, imageUrl, width, height, scaleMode, x, y, opacity, effects, visible } = imageData;
  
  // 画像を挿入するためのRectangleを作成
  const rect = figma.createRectangle();
  rect.name = name || `Image ${index !== undefined ? index + 1 : ''}`;
  rect.resize(width || 100, height || 100);
  
  // 位置の設定
  if (x !== undefined) rect.x = x;
  if (y !== undefined) rect.y = y;
  
  // 画像URLからFigmaで使用できる画像を取得（非同期処理）
  figma.createImageAsync(imageUrl)
    .then(image => {
      // 画像を塗りつぶしとして設定
      const imageFill: ImagePaint = {
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: scaleMode || 'FILL'
      };
      
      rect.fills = [imageFill];
      
      // 透明度の設定
      if (opacity !== undefined) rect.opacity = opacity;
      
      // エフェクトの設定
      if (effects && Array.isArray(effects)) {
        try {
          rect.effects = effects as Effect[];
        } catch (e) {
          console.error('Error setting effects:', e);
        }
      }
      
      // 表示/非表示の設定
      if (visible !== undefined) rect.visible = visible;
    })
    .catch(error => {
      console.error('Error creating image:', error);
      // エラー時は赤い矩形を表示
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    });
  
  // 現在のページに追加
  figma.currentPage.appendChild(rect);
  
  return rect;
}

// コンポーネントの作成
function createComponentElement(componentData: {
  name?: string;
  description?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  opacity?: number;
  effects?: Effect[];
  visible?: boolean;
}, index?: number) {
  const { name, description, x, y, width, height, fills, strokes, strokeWeight, strokeAlign, cornerRadius, opacity, effects, visible } = componentData;
  const component = figma.createComponent();
  component.name = name || `Component ${index !== undefined ? index + 1 : ''}`;
  
  if (description) {
    component.description = description;
  }
  
  component.resize(width || 100, height || 100);
  
  // 位置の設定
  if (x !== undefined) component.x = x;
  if (y !== undefined) component.y = y;
  
  // 塗りつぶしの設定
  if (fills && Array.isArray(fills)) {
    try {
      component.fills = fills as Paint[];
    } catch (e) {
      console.error('Error setting fills:', e);
    }
  }
  
  // ストロークの設定
  if (strokes && Array.isArray(strokes)) {
    try {
      component.strokes = strokes as Paint[];
    } catch (e) {
      console.error('Error setting strokes:', e);
    }
  }
  
  if (strokeWeight !== undefined) component.strokeWeight = strokeWeight;
  if (strokeAlign) component.strokeAlign = strokeAlign;
  
  // 角丸の設定
  if (cornerRadius !== undefined) component.cornerRadius = cornerRadius;
  
  // 透明度の設定
  if (opacity !== undefined) component.opacity = opacity;
  
  // エフェクトの設定
  if (effects && Array.isArray(effects)) {
    try {
      component.effects = effects as Effect[];
    } catch (e) {
      console.error('Error setting effects:', e);
    }
  }
  
  // 表示/非表示の設定
  if (visible !== undefined) component.visible = visible;
  
  // 現在のページに追加
  figma.currentPage.appendChild(component);
  
  return component;
}

// UIからのメッセージを処理
figma.ui.onmessage = (msg) => {
  if (msg.type === 'register') {
    healthcheckWithServer();
  } else if (msg.type === 'cancel') {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    figma.closePlugin();
  }
};

// 初期化時の接続はフォントの読み込み完了後に行うため、ここでは実行しない
// healthcheckWithServer();
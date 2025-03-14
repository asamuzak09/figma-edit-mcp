// プラグイン接続情報の型
export interface PluginConnection {
  pluginId: string;
  lastSeen: Date;
  status: 'connected' | 'pending';
}

// メッセージの型
export interface Message {
  id: number;
  timestamp: Date;
  type: string;
  updates: any;
}

// Figma更新パラメータの型
export interface FigmaUpdateParams {
  fileId: string;
  updates: Array<{
    type: string;
    data: any;
  }>;
}

// 更新の型
export interface Update {
  type: 'createFrame' | 'createText' | 'createRectangle' | 'createEllipse' | 'createLine' | 'createImage' | 'createComponent';
  data: any;
}

// バッチ更新の型
export interface BatchUpdate {
  type: 'createFrame' | 'createText' | 'createRectangle' | 'createEllipse' | 'createLine' | 'createImage' | 'createComponent';
  data: any;
}

// プラグイン接続リクエストの型
export interface PluginHealthcheckRequest {
  pluginId: string;
  fileId: string;
}

// Figma API型定義
export type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type Paint = {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  color?: Color;
  opacity?: number;
  blendMode?: BlendMode;
  visible?: boolean;
  [key: string]: any;
};

export type BlendMode = 
  'NORMAL' | 'DARKEN' | 'MULTIPLY' | 'LINEAR_BURN' | 'COLOR_BURN' | 
  'LIGHTEN' | 'SCREEN' | 'LINEAR_DODGE' | 'COLOR_DODGE' | 
  'OVERLAY' | 'SOFT_LIGHT' | 'HARD_LIGHT' | 
  'DIFFERENCE' | 'EXCLUSION' | 'HUE' | 'SATURATION' | 'COLOR' | 'LUMINOSITY';

export type Effect = {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: BlendMode;
  offset?: { x: number; y: number };
  [key: string]: any;
};

// 共通のプロパティ型
export interface BaseNodeProps {
  name?: string;
  x?: number;
  y?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
  strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND';
  opacity?: number;
  blendMode?: BlendMode;
  effects?: Effect[];
  visible?: boolean;
}

// フレーム作成のプロパティ型
export interface CreateFrameProps extends BaseNodeProps {
  width: number;
  height: number;
  cornerRadius?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

// テキスト作成のプロパティ型
export interface CreateTextProps extends BaseNodeProps {
  content: string;
  fontSize?: number;
  fontName?: { family: string; style: string };
  fontWeight?: string; // 'Regular' | 'Bold' | etc.
  letterSpacing?: number;
  lineHeight?: number | { value: number; unit: 'PIXELS' | 'PERCENT' };
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  paragraphIndent?: number;
  paragraphSpacing?: number;
}

// 矩形作成のプロパティ型
export interface CreateRectangleProps extends BaseNodeProps {
  width: number;
  height: number;
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
}

// 楕円作成のプロパティ型
export interface CreateEllipseProps extends BaseNodeProps {
  width: number;
  height: number;
  arcData?: { startingAngle: number; endingAngle: number; innerRadius: number };
}

// 線作成のプロパティ型
export interface CreateLineProps extends BaseNodeProps {
  strokeWeight: number;
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
  points: { x: number; y: number }[];
}

// ベクター作成のプロパティ型
export interface CreateVectorProps extends BaseNodeProps {
  vectorNetwork: {
    vertices: { x: number; y: number; strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' }[];
    segments: { start: number; end: number; tangentStart?: { x: number; y: number }; tangentEnd?: { x: number; y: number } }[];
  };
}

// 画像挿入のプロパティ型
export interface CreateImageProps extends BaseNodeProps {
  imageUrl: string;
  width: number;
  height: number;
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
}

// グループ作成のプロパティ型
export interface CreateGroupProps extends BaseNodeProps {
  children: string[]; // 子要素のIDリスト
}

// コンポーネント作成のプロパティ型
export interface CreateComponentProps extends BaseNodeProps {
  width: number;
  height: number;
  description?: string;
} 
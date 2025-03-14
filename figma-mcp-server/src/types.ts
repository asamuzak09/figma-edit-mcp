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
  updates: Record<string, any>;
}

// プラグイン接続リクエストの型
export interface PluginHealthcheckRequest {
  pluginId: string;
  fileId: string;
} 
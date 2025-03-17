import { Message, PluginConnection } from '../types.js';

// プラグインからの接続を管理
export const pluginConnections: Record<string, PluginConnection> = {};

// ファイルごとのメッセージキュー
export const messageQueues: Record<string, Message[]> = {};

/**
 * メッセージキューにメッセージを追加する
 * @param fileId Figmaファイルのid
 * @param updates 更新内容
 * @returns 成功したかどうか
 */
export function addToMessageQueue(fileId: string, updates: any): boolean {
  try {
    // 重要なログのみ残す
    console.error(`Adding message to queue for file ${fileId}`);
    
    // プラグインが接続されているか確認
    if (!pluginConnections[fileId]) {
      // 接続がない場合でもキューを作成しておく（後でプラグインが接続する可能性がある）
      console.error(`Warning: No plugin currently connected for file ${fileId}, but will queue message anyway`);
      
      // 接続情報を仮作成
      pluginConnections[fileId] = {
        pluginId: 'pending-connection',
        lastSeen: new Date(),
        status: 'pending'
      };
    }
    
    // メッセージをキューに追加
    if (!messageQueues[fileId]) {
      messageQueues[fileId] = [];
    }
    
    const newMessage: Message = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'update',
      updates
    };
    
    messageQueues[fileId].push(newMessage);
    console.error(`Message added to queue. Queue length: ${messageQueues[fileId].length}`);
    
    return true;
  } catch (error) {
    console.error('Error adding message to queue:', error);
    return false;
  }
}

/**
 * メッセージキューからメッセージを取得して削除する
 * @param fileId Figmaファイルのid
 * @returns メッセージの配列
 */
export function getAndClearMessages(fileId: string): Message[] {
  const messages = messageQueues[fileId] || [];
  
  if (messages.length > 0) {
    console.error(`Found ${messages.length} messages for file ${fileId}`);
    // メッセージを返した後、キューをクリア
    messageQueues[fileId] = [];
  }
  
  return messages;
} 
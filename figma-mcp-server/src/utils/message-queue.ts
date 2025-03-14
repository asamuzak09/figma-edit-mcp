import { Message, PluginConnection } from '../types';

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
    console.error(`Attempting to add message to queue for file ${fileId}`);
    
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
    } else {
      console.error(`Found existing connection for file ${fileId}: ${JSON.stringify(pluginConnections[fileId])}`);
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
    console.error(`Message directly added to queue for file ${fileId}`);
    console.error(`Queue length: ${messageQueues[fileId].length}`);
    console.error(`Queue content: ${JSON.stringify(messageQueues[fileId], null, 2)}`);
    
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
    console.error(`Returning ${messages.length} messages for file ${fileId}`);
    // メッセージを返した後、キューをクリア
    messageQueues[fileId] = [];
    console.error(`Queue cleared for file ${fileId}`);
  }
  
  return messages;
} 
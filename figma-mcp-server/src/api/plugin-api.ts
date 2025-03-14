import express from 'express';
import { PluginHealthcheckRequest } from '../types';
import { pluginConnections, getAndClearMessages } from '../utils/message-queue';

// プラグインAPI用のルーターを作成
export const pluginRouter = express.Router();

// プラグインの接続状態を確認するエンドポイント
pluginRouter.post('/healthcheck', (req, res) => {
  const { pluginId, fileId } = req.body as PluginHealthcheckRequest;
  if (!pluginId || !fileId) {
    return res.status(400).json({ error: 'pluginId and fileId are required' });
  }
  
  pluginConnections[fileId] = {
    pluginId,
    lastSeen: new Date(),
    status: 'connected'
  };
  
  console.error(`Plugin ${pluginId} healthcheck successful for file ${fileId}`);
  res.json({ success: true });
});

// プラグインからのポーリングエンドポイント
pluginRouter.get('/poll/:fileId/:pluginId', (req, res) => {
  const { fileId, pluginId } = req.params;
  
  console.error(`Polling request received from plugin ${pluginId} for file ${fileId}`);
  
  // 接続情報を更新
  if (pluginConnections[fileId]) {
    pluginConnections[fileId].lastSeen = new Date();
    pluginConnections[fileId].status = 'connected';
    console.error(`Updated existing connection for file ${fileId}`);
  } else {
    console.error(`Creating new connection for file ${fileId} with plugin ${pluginId}`);
    pluginConnections[fileId] = {
      pluginId,
      lastSeen: new Date(),
      status: 'connected'
    };
  }
  
  // キューからメッセージを取得して返す
  const messages = getAndClearMessages(fileId);
  console.error(`Queue status for file ${fileId}: ${messages.length} messages`);
  
  if (messages.length > 0) {
    console.error(`Returning ${messages.length} messages to plugin for file ${fileId}:`, JSON.stringify(messages, null, 2));
    return res.json({ messages });
  }
  
  // メッセージがない場合は空の配列を返す
  console.error(`No messages for file ${fileId}, returning empty array`);
  return res.json({ messages: [] });
}); 
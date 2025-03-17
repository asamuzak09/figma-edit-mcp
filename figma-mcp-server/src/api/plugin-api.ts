import express from 'express';
import { PluginHealthcheckRequest } from '../types.js';
import { pluginConnections, getAndClearMessages, addToMessageQueue } from './message-queue.js';

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
  
  res.json({ success: true });
});

// プラグインからのポーリングエンドポイント
pluginRouter.get('/poll/:fileId/:pluginId', (req, res) => {
  const { fileId, pluginId } = req.params;
  
  // 接続情報を更新
  if (pluginConnections[fileId]) {
    pluginConnections[fileId].lastSeen = new Date();
    pluginConnections[fileId].status = 'connected';
  } else {
    pluginConnections[fileId] = {
      pluginId,
      lastSeen: new Date(),
      status: 'connected'
    };
  }
  
  // キューからメッセージを取得して返す
  const messages = getAndClearMessages(fileId);
  
  return res.json({ messages });
});
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { FigmaUpdateParams } from '../../types.js';
import { addToMessageQueue } from '../../api/message-queue.js';

/**
 * update_file ツールのハンドラー
 * @param params ツールパラメータ
 * @returns ツールの実行結果
 */
export async function handleUpdateFileTool(params: FigmaUpdateParams) {
  try {
    const { fileId, updates } = params;
    console.error(`Received update_file request for file ${fileId}`);
    
    // メッセージキューに追加
    let success = false;
    
    if (updates && Array.isArray(updates)) {
      // 更新の処理
      console.error(`Processing updates with ${updates.length} items`);
      
      // テキスト要素のcontentパラメータをチェック
      for (const update of updates) {
        if (update.type === 'createText') {
          if (!update.data || !update.data.content) {
            const errorMessage = `Error: Missing required parameter "content" for createText element "${update.data?.name || 'unnamed'}"`;
            console.error(errorMessage);
            return {
              content: [{
                type: "text",
                text: errorMessage
              }],
              isError: true
            };
          } else if (update.data.content === '') {
            const errorMessage = `Error: Parameter "content" cannot be empty for createText element "${update.data.name || 'unnamed'}"`;
            console.error(errorMessage);
            return {
              content: [{
                type: "text",
                text: errorMessage
              }],
              isError: true
            };
          }
        }
      }
      
      // 更新をそのままキューに追加（変換せずに）
      success = addToMessageQueue(fileId, { updates });
    } else {
      console.error(`No valid updates found in request`);
      return {
        content: [{
          type: "text",
          text: `Error: No valid updates found in request`
        }],
        isError: true
      };
    }
    
    if (success) {
      console.error(`Successfully added update to message queue for file ${fileId}`);
      return {
        content: [{
          type: "text",
          text: `Update request sent to Figma plugin for file ${fileId}`
        }]
      };
    } else {
      console.error(`Failed to add update to message queue for file ${fileId}`);
      return {
        content: [{
          type: "text",
          text: `Warning: Could not find connected plugin for file ${fileId}. Please open the file in Figma and run the plugin first.`
        }],
        isError: true
      };
    }
  } catch (error) {
    console.error('Error processing update request:', error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
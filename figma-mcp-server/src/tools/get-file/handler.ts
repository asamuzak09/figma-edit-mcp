import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { FigmaGetFileParams } from '../../types.js';
import { FIGMA_ACCESS_TOKEN } from '../../config/index.js';
import axios from 'axios';

/**
 * get_file ツールのハンドラー
 * @param params ツールパラメータ
 * @returns ツールの実行結果
 */
export async function handleGetFileTool(params: FigmaGetFileParams) {
  try {
    const { fileId, includeComponents = false, includeStyles = false, includeNodes = [], depth } = params;
    console.error(`Received get_file request for file ${fileId}`);
    
    if (!FIGMA_ACCESS_TOKEN) {
      const errorMessage = "FIGMA_ACCESS_TOKEN is not configured";
      console.error(errorMessage);
      return {
        content: [{
          type: "text",
          text: `Error: ${errorMessage}`
        }],
        isError: true
      };
    }
    
    // クエリパラメータの構築
    const queryParams = new URLSearchParams();
    
    if (includeComponents) {
      queryParams.append('components', 'true');
    }
    
    if (includeStyles) {
      queryParams.append('styles', 'true');
    }
    
    if (includeNodes && includeNodes.length > 0) {
      queryParams.append('ids', includeNodes.join(','));
    }
    
    if (depth !== undefined) {
      queryParams.append('depth', depth.toString());
    }
    
    // Figma APIを呼び出してファイルの内容を取得
    const url = `https://api.figma.com/v1/files/${fileId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // デバッグ情報を出力
    console.error(`Requesting Figma API: ${url}`);
    console.error(`Using token: ${FIGMA_ACCESS_TOKEN ? FIGMA_ACCESS_TOKEN.substring(0, 5) + '...' : 'undefined'}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN
        }
      });
      
      const fileData = response.data;
      
      // ファイルデータを整形して返す
      return {
        content: [{
          type: "text",
          text: JSON.stringify(fileData, null, 2)
        }]
      };
    } catch (axiosError: any) {
      console.error(`Figma API error:`, axiosError.response?.status, axiosError.response?.statusText);
      console.error(`Error details:`, JSON.stringify(axiosError.response?.data || {}, null, 2));
      
      // エラーレスポンスの詳細情報を取得
      const errorDetails = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      
      return {
        content: [{
          type: "text",
          text: `Error: Failed to fetch Figma file. Status: ${axiosError.response?.status || 'Unknown'} ${axiosError.response?.statusText || ''}\nDetails: ${errorDetails}`
        }],
        isError: true
      };
    }
  } catch (error) {
    console.error('Error processing get_file request:', error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
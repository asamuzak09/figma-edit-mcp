import { ToolUsageInfo } from '../../types.js';

/**
 * ツールの使用方法情報をフォーマットする
 * @param toolUsageInfo ツールの使用方法情報
 * @returns フォーマットされた使用方法情報
 */
export function formatToolUsageInfo(toolUsageInfo: ToolUsageInfo): string {
  let result = `# ${toolUsageInfo.name}\n\n`;
  
  // 説明
  result += `## 説明\n${toolUsageInfo.description}\n\n`;
  
  // 入力スキーマ
  result += `## パラメータ\n\`\`\`json\n${JSON.stringify(toolUsageInfo.inputSchema, null, 2)}\n\`\`\`\n\n`;
  
  // 使用例
  result += `## 使用例\n`;
  toolUsageInfo.examples.forEach((example, index) => {
    result += `### ${index + 1}. ${example.title}\n`;
    result += `${example.description}\n\n`;
    result += `\`\`\`\n${example.code}\n\`\`\`\n\n`;
    if (example.result) {
      result += `結果:\n\`\`\`\n${example.result}\n\`\`\`\n\n`;
    }
  });
  
  // 注意事項
  if (toolUsageInfo.notes && toolUsageInfo.notes.length > 0) {
    result += `## 注意事項\n`;
    toolUsageInfo.notes.forEach(note => {
      result += `- ${note}\n`;
    });
  }
  
  return result;
}
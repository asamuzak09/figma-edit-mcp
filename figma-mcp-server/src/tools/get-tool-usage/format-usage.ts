import { ToolUsageInfo } from '../../types.js';

/**
 * ツールの使用方法情報をフォーマットする
 * @param toolUsageInfo ツールの使用方法情報
 * @returns フォーマットされた使用方法情報
 */
export function formatToolUsageInfo(toolUsageInfo: ToolUsageInfo): string {
  let result = `# ${toolUsageInfo.name}\n\n`;
  
  // Description
  result += `## Description\n${toolUsageInfo.description}\n\n`;
  
  // Input schema
  result += `## Parameters\n\`\`\`json\n${JSON.stringify(toolUsageInfo.inputSchema, null, 2)}\n\`\`\`\n\n`;
  
  // Examples
  result += `## Examples\n`;
  toolUsageInfo.examples.forEach((example, index) => {
    result += `### ${index + 1}. ${example.title}\n`;
    result += `${example.description}\n\n`;
    result += `\`\`\`\n${example.code}\n\`\`\`\n\n`;
    if (example.result) {
      result += `Result:\n\`\`\`\n${example.result}\n\`\`\`\n\n`;
    }
  });
  
  // Notes
  if (toolUsageInfo.notes && toolUsageInfo.notes.length > 0) {
    result += `## Notes\n`;
    toolUsageInfo.notes.forEach(note => {
      result += `- ${note}\n`;
    });
  }
  
  return result;
}

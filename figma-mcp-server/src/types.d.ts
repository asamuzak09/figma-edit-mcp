declare module '@modelcontextprotocol/sdk' {
  export interface MCPServerOptions {
    tools: Array<{
      name: string;
      description: string;
      inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
      };
      handler: (params: any) => Promise<{
        status: string;
        data: any;
      }>;
    }>;
  }

  export class MCPServer {
    constructor(options: MCPServerOptions);
    listen(port: number, callback?: () => void): void;
  }
} 
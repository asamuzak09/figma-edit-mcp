import axios from 'axios';

const FIGMA_API_URL = 'https://api.figma.com/v1';

export class FigmaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private get headers() {
    return {
      'X-Figma-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  async getFile(fileId: string) {
    const response = await axios.get(`${FIGMA_API_URL}/files/${fileId}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async updateFile(fileId: string, updates: any) {
    const response = await axios.patch(
      `${FIGMA_API_URL}/files/${fileId}`,
      updates,
      {
        headers: this.headers,
      }
    );
    return response.data;
  }
} 
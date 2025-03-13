export class Config {
  private static instance: Config;
  private figmaAccessToken: string;

  private constructor() {
    this.figmaAccessToken = process.env.FIGMA_ACCESS_TOKEN || '';
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public getFigmaAccessToken(): string {
    return this.figmaAccessToken;
  }
} 
declare module 'mastodon-api' {
  export function login(options: {
    access_token?: string;
    api_url?: string;
  }): Promise<any>;

  export class Mastodon {
    constructor(options: {
      access_token?: string;
      api_url?: string;
    });

    post(endpoint: string, data?: any): Promise<any>;
    get(endpoint: string, data?: any): Promise<any>;
  }
}

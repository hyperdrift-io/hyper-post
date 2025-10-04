import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
const Mastodon = require('mastodon-api');

export class MastodonPlatform extends BasePlatform {
  get name(): string {
    return 'mastodon';
  }

  get displayName(): string {
    return 'Mastodon';
  }

  protected getRequiredCredentials(): string[] {
    return ['instance', 'accessToken'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      const { instance, accessToken } = this.credentials;

      // Initialize Mastodon API client
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });

      // Prepare the post content
      let status = content.content;

      if (content.title) {
        status = `${content.title}\n\n${content.content}`;
      }

      // Add URL if provided
      if (content.url) {
        status += `\n\n${content.url}`;
      }

      // Add tags
      if (content.tags && content.tags.length > 0) {
        const tagString = content.tags.map(tag => `#${tag}`).join(' ');
        status += `\n\n${tagString}`;
      }

      // Post to Mastodon
      const response = await client.post('statuses', {
        status,
        visibility: 'public'
      });

      return this.createResult(
        true,
        response.data.id,
        response.data.url
      );

    } catch (error) {
      return this.createResult(
        false,
        undefined,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async gatherAnalytics(postUrl: string): Promise<PostAnalytics> {
    try {
      this.validateCredentials();

      const { instance, accessToken } = this.credentials;

      // Extract status ID from Mastodon URL
      // URL format: https://instance.com/@username/statusId
      const urlMatch = postUrl.match(/\/@[^\/]+\/(\d+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Mastodon URL format: ${postUrl}`);
      }

      const statusId = urlMatch[1];

      // Initialize Mastodon API client
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });

      // Get status information
      const response = await client.get(`statuses/${statusId}`);

      const status = response.data;

      return {
        likes: status.favourites_count || 0,
        reposts: status.reblogs_count || 0,
        replies: status.replies_count || 0,
        bookmarks: status.bookmarks_count || 0
      };

    } catch (error) {
      console.warn(`Failed to gather Mastodon analytics for ${postUrl}:`, error);
      return {};
    }
  }

  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    try {
      this.validateCredentials();

      const { instance, accessToken } = this.credentials;

      // Initialize Mastodon API client
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });

      // Get user's account information first
      const accountResponse = await client.get('accounts/verify_credentials');
      const account = accountResponse.data;

      // Get recent posts from the user's account
      const statusesResponse = await client.get(`accounts/${account.id}/statuses`, {
        limit: limit
      });

      const posts = statusesResponse.data.map((status: any) => ({
        url: status.url,
        content: status.content.replace(/<[^>]*>/g, ''), // Remove HTML tags
        createdAt: new Date(status.created_at),
        analytics: {
          likes: status.favourites_count || 0,
          reposts: status.reblogs_count || 0,
          replies: status.replies_count || 0,
          bookmarks: status.bookmarks_count || 0
        }
      }));

      return posts;

    } catch (error) {
      console.warn(`Failed to discover Mastodon posts:`, error);
      return [];
    }
  }
}

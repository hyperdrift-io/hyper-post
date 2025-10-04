import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
import { BskyAgent, RichText } from '@atproto/api';

export class BlueskyPlatform extends BasePlatform {
  private agent: BskyAgent;

  constructor(credentials: Record<string, string>) {
    super(credentials);
    this.agent = new BskyAgent({ service: 'https://bsky.social' });
  }

  get name(): string {
    return 'bluesky';
  }

  get displayName(): string {
    return 'Bluesky';
  }

  protected getRequiredCredentials(): string[] {
    return ['identifier', 'password'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      const { identifier, password } = this.credentials;

      // Login to Bluesky
      await this.agent.login({
        identifier,
        password
      });

      // Prepare the post content
      let postText = content.content;

      if (content.title) {
        postText = `${content.title}\n\n${content.content}`;
      }

      // Create rich text for better formatting
      const rt = new RichText({ text: postText });
      await rt.detectFacets(this.agent);

      const postData: any = {
        text: rt.text,
        facets: rt.facets
      };

      // Add embed if URL is provided
      if (content.url) {
        postData.embed = {
          $type: 'app.bsky.embed.external',
          external: {
            uri: content.url,
            title: content.title || 'Link',
            description: content.content.substring(0, 200)
          }
        };
      }

      // Post to Bluesky
      const response = await this.agent.post(postData);

      return this.createResult(
        true,
        response.uri,
        `https://bsky.app/profile/${identifier}/post/${response.uri.split('/').pop()}`
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

      // Extract post information from Bluesky URL
      // URL format: https://bsky.app/profile/username/post/postId
      const urlMatch = postUrl.match(/\/profile\/([^\/]+)\/post\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Bluesky URL format: ${postUrl}`);
      }

      const username = urlMatch[1];
      const postId = urlMatch[2];

      const { identifier, password } = this.credentials;

      // Login to Bluesky
      await this.agent.login({
        identifier,
        password
      });

      // Get post thread to see engagement metrics
      const threadResponse = await this.agent.getPostThread({
        uri: `at://${username}/app.bsky.feed.post/${postId}`
      });

      const post = threadResponse.data.thread.post as any;

      return {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        views: post.viewCount || 0
      };

    } catch (error) {
      console.warn(`Failed to gather Bluesky analytics for ${postUrl}:`, error);
      return {};
    }
  }

  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    try {
      this.validateCredentials();

      const { identifier, password } = this.credentials;

      // Login to Bluesky
      await this.agent.login({
        identifier,
        password
      });

      // Get user's profile
      const profile = await this.agent.getProfile({ actor: identifier });

      // Get recent posts from the user's feed
      const response = await this.agent.getAuthorFeed({
        actor: identifier,
        limit: limit
      });

      const posts = response.data.feed.map((item: any) => {
        const post = item.post;
        const record = post.record;

        return {
          url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
          content: record.text || '',
          createdAt: new Date(record.createdAt),
          analytics: {
            likes: post.likeCount || 0,
            reposts: post.repostCount || 0,
            replies: post.replyCount || 0,
            views: post.viewCount || 0
          }
        };
      });

      return posts;

    } catch (error) {
      console.warn(`Failed to discover Bluesky posts:`, error);
      return [];
    }
  }
}

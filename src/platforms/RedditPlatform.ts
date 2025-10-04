import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
import axios from 'axios';

export class RedditPlatform extends BasePlatform {
  private accessToken: string | null = null;

  get name(): string {
    return 'reddit';
  }

  get displayName(): string {
    return 'Reddit';
  }

  protected getRequiredCredentials(): string[] {
    return ['clientId', 'clientSecret', 'username', 'password'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      // Get access token if we don't have one
      if (!this.accessToken) {
        await this.authenticate();
      }

      const { subreddit = 'hyperdrift' } = this.credentials;

      // Prepare the post data
      const postData: any = {
        title: content.title || 'New Post',
        text: content.content,
        kind: 'self', // Text post
        sr: subreddit
      };

      // Add URL if provided (link post instead of text post)
      if (content.url) {
        postData.kind = 'link';
        postData.url = content.url;
        // For link posts, text becomes the comment
        if (content.content) {
          postData.text = content.content;
        }
      }

      // Submit the post
      const response = await axios.post(
        'https://oauth.reddit.com/api/submit',
        new URLSearchParams(postData).toString(),
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'HyperPost:v0.1.0 (by /u/hyperdrift)'
          }
        }
      );

      if (response.data.success) {
        const postId = response.data.jquery?.[10]?.[3]?.[0]?.data?.id;
        const postUrl = `https://reddit.com/r/${subreddit}/comments/${postId}`;

        return this.createResult(true, postId, postUrl);
      } else {
        return this.createResult(false, undefined, undefined, 'Reddit API submission failed');
      }

      } catch (error: any) {
        // Check if token expired and try to refresh
        if (error.response?.status === 401) {
          this.accessToken = null;
          try {
            await this.authenticate();
            // Retry the post
            return this.post(content);
          } catch (retryError) {
            return this.createResult(false, undefined, undefined, 'Authentication failed');
          }
        }

        return this.createResult(
          false,
          undefined,
          undefined,
          error.response?.data?.message || error.message || 'Unknown error'
        );
      }
  }

  private async authenticate(): Promise<void> {
    try {
      const { clientId, clientSecret, username, password } = this.credentials;

      // Get access token using script authentication
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        new URLSearchParams({
          grant_type: 'password',
          username,
          password
        }).toString(),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'HyperPost:v0.1.0 (by /u/hyperdrift)'
          }
        }
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error: any) {
      throw new Error(`Reddit authentication failed: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    }
  }

  async gatherAnalytics(postUrl: string): Promise<PostAnalytics> {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Extract post information from Reddit URL
      // URL format: https://www.reddit.com/r/subreddit/comments/postId/title/
      const urlMatch = postUrl.match(/\/r\/[^\/]+\/comments\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Reddit URL format: ${postUrl}`);
      }

      const postId = urlMatch[1];

      // Get post information from Reddit API
      const response = await axios.get(
        `https://oauth.reddit.com/by_id/t3_${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': 'HyperPost:v0.1.0 (by /u/hyperdrift)'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.children.length > 0) {
        const post = response.data.data.children[0].data;

        return {
          likes: post.score || 0, // upvotes - downvotes
          replies: post.num_comments || 0,
          views: post.view_count || 0,
          reposts: post.num_crossposts || 0
        };
      }

      return {};

    } catch (error: any) {
      console.warn(`Failed to gather Reddit analytics for ${postUrl}:`, error);
      return {};
    }
  }

  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }

      const { username } = this.credentials;

      // Get user's recent posts
      const response = await axios.get(`https://oauth.reddit.com/user/${username}/submitted`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': 'HyperPost:v0.1.0 (by /u/hyperdrift)'
        },
        params: {
          limit: limit,
          sort: 'new'
        }
      });

      const posts = response.data.data.children.map((child: any) => {
        const post = child.data;
        return {
          url: `https://www.reddit.com${post.permalink}`,
          content: post.selftext || post.title,
          createdAt: new Date(post.created_utc * 1000),
          analytics: {
            likes: post.score || 0,
            reposts: 0, // Reddit doesn't have reposts
            replies: post.num_comments || 0,
            views: 0 // Reddit doesn't expose view counts easily
          }
        };
      });

      return posts;

    } catch (error: any) {
      console.warn(`Failed to discover Reddit posts:`, error);
      return [];
    }
  }
}

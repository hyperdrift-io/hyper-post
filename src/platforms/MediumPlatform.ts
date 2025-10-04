import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
import axios from 'axios';

export class MediumPlatform extends BasePlatform {
  get name(): string {
    return 'medium';
  }

  get displayName(): string {
    return 'Medium';
  }

  protected getRequiredCredentials(): string[] {
    return ['integrationToken'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      const { integrationToken } = this.credentials;

      // First get user info to get author ID
      const userResponse = await axios.get('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      });

      const userId = userResponse.data.data.id;

      // Prepare post data for Medium
      const postData = {
        title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? '...' : ''),
        contentFormat: 'markdown',
        content: content.content,
        canonicalUrl: content.url,
        tags: content.tags || [],
        publishStatus: 'public'
      };

      // Post to Medium
      const response = await axios.post(`https://api.medium.com/v1/users/${userId}/posts`, postData, {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      });

      const post = response.data.data;

      return this.createResult(
        true,
        post.id,
        post.url
      );

    } catch (error: any) {
      console.error('Medium posting error:', error.response?.data || error.message);
      return this.createResult(
        false,
        undefined,
        undefined,
        error.response?.data?.errors?.[0]?.message || error.message
      );
    }
  }

  async gatherAnalytics(postUrl: string): Promise<PostAnalytics> {
    try {
      this.validateCredentials();

      const { integrationToken } = this.credentials;

      // Extract post ID from Medium URL
      // URL format: https://medium.com/@username/post-title-hash
      const urlMatch = postUrl.match(/\/([^\/]+)$/);
      if (!urlMatch) {
        throw new Error(`Invalid Medium URL format: ${postUrl}`);
      }

      const postId = urlMatch[1];

      // Medium doesn't have a public API for analytics
      // We can only get basic info about the post
      const response = await axios.get(`https://api.medium.com/v1/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Accept': 'application/json'
        }
      });

      const post = response.data.data;

      return {
        likes: post.clapCount || 0,
        replies: 0, // Medium doesn't expose comment counts easily
        views: 0, // Medium doesn't expose view counts in API
        bookmarks: post.voterCount || 0
      };

    } catch (error: any) {
      console.warn(`Failed to gather Medium analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }

  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    try {
      this.validateCredentials();

      const { integrationToken } = this.credentials;

      // Get user publications and posts
      const userResponse = await axios.get('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Accept': 'application/json'
        }
      });

      const userId = userResponse.data.data.id;

      // Get user's posts
      const postsResponse = await axios.get(`https://api.medium.com/v1/users/${userId}/posts`, {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Accept': 'application/json'
        },
        params: {
          limit: Math.min(limit, 50) // Medium limits to 50
        }
      });

      const posts = postsResponse.data.data;

      return posts.map((post: any) => ({
        url: post.url,
        content: post.title + '\n\n' + (post.virtuals?.subtitle || ''),
        createdAt: new Date(post.createdAt),
        analytics: {
          likes: post.clapCount || 0,
          replies: 0,
          views: 0,
          bookmarks: post.voterCount || 0
        }
      }));

    } catch (error: any) {
      console.warn(`Failed to discover Medium posts:`, error.response?.data || error.message);
      return [];
    }
  }
}

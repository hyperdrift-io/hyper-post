import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
import axios from 'axios';

export class DevtoPlatform extends BasePlatform {
  get name(): string {
    return 'devto';
  }

  get displayName(): string {
    return 'Dev.to';
  }

  protected getRequiredCredentials(): string[] {
    return ['apiKey'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      const { apiKey } = this.credentials;

      // Prepare article data for Dev.to
      const articleData = {
        article: {
          title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? '...' : ''),
          body_markdown: content.content,
          published: true,
          tags: content.tags || [],
          canonical_url: content.url
        }
      };

      // Post to Dev.to
      const response = await axios.post('https://dev.to/api/articles', articleData, {
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const article = response.data;

      return this.createResult(
        true,
        article.id.toString(),
        article.url
      );

    } catch (error: any) {
      console.error('Dev.to posting error:', error.response?.data || error.message);
      return this.createResult(
        false,
        undefined,
        undefined,
        error.response?.data?.error || error.message
      );
    }
  }

  async gatherAnalytics(postUrl: string): Promise<PostAnalytics> {
    try {
      this.validateCredentials();

      const { apiKey } = this.credentials;

      // Extract article ID from Dev.to URL
      // URL format: https://dev.to/username/slug or https://dev.to/username/slug-123abc
      const urlMatch = postUrl.match(/\/([^\/]+)\/([^\/\-]+)(?:-([a-z0-9]+))?$/);
      if (!urlMatch) {
        throw new Error(`Invalid Dev.to URL format: ${postUrl}`);
      }

      const username = urlMatch[1];
      const slug = urlMatch[2];
      const id = urlMatch[3];

      // Get article by ID if available, otherwise get user's articles and find by slug
      let article;
      if (id) {
        // Get article by ID
        const response = await axios.get(`https://dev.to/api/articles/${id}`, {
          headers: {
            'Api-Key': apiKey
          }
        });
        article = response.data;
      } else {
        // Get user's articles and find by slug
        const response = await axios.get('https://dev.to/api/articles/me', {
          headers: {
            'Api-Key': apiKey
          }
        });
        const articles = response.data;
        article = articles.find((a: any) => a.slug === slug || a.slug.startsWith(slug));
      }

      if (!article) {
        console.warn(`Could not find Dev.to article for URL: ${postUrl}`);
        return {};
      }

      return {
        likes: article.positive_reactions_count || 0,
        reposts: 0, // Dev.to doesn't have reposts
        replies: article.comments_count || 0,
        views: article.page_views_count || 0
      };

    } catch (error: any) {
      console.warn(`Failed to gather Dev.to analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }

  /**
   * Discover recent articles from the user's account
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    try {
      this.validateCredentials();

      const { apiKey } = this.credentials;

      // Get user's published articles
      const response = await axios.get('https://dev.to/api/articles/me/published', {
        headers: {
          'Api-Key': apiKey
        },
        params: {
          per_page: Math.min(limit, 100) // Dev.to limits to 100 per page
        }
      });

      const articles = response.data;

      return articles.map((article: any) => ({
        url: article.url,
        content: article.body_markdown || article.description || article.title,
        createdAt: new Date(article.created_at),
        analytics: {
          likes: article.positive_reactions_count || 0,
          reposts: 0,
          replies: article.comments_count || 0,
          views: article.page_views_count || 0
        }
      }));

    } catch (error: any) {
      console.warn(`Failed to discover Dev.to posts:`, error.response?.data || error.message);
      return [];
    }
  }
}

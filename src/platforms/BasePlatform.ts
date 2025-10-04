import { SocialPost, PostingResult, PlatformCredentials } from '../types';

export interface PostAnalytics {
  likes?: number;
  reposts?: number;
  replies?: number;
  views?: number;
  bookmarks?: number;
  [key: string]: number | undefined;
}

export abstract class BasePlatform {
  protected credentials: Record<string, string>;

  constructor(credentials: Record<string, string>) {
    this.credentials = credentials;
  }

  abstract get name(): string;
  abstract get displayName(): string;

  abstract post(content: SocialPost): Promise<PostingResult>;

  /**
   * Gather analytics for a specific post URL
   * Returns available metrics (likes, reposts, replies, views, etc.)
   */
  abstract gatherAnalytics(postUrl: string): Promise<PostAnalytics>;

  /**
   * Discover recent posts from the user's account on this platform
   * Returns posts with their current analytics
   */
  abstract discoverPosts(limit?: number): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>>;

  protected validateCredentials(): void {
    const requiredFields = this.getRequiredCredentials();
    const missing = requiredFields.filter(field => !this.credentials[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required credentials for ${this.displayName}: ${missing.join(', ')}`);
    }
  }

  protected abstract getRequiredCredentials(): string[];

  protected createResult(
    success: boolean,
    postId?: string,
    url?: string,
    error?: string
  ): PostingResult {
    return {
      platform: this.name,
      success,
      postId,
      url,
      error
    };
  }
}

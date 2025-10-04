import {
  SocialPost,
  PlatformCredentials,
  PlatformConfig,
  MultiPlatformResult,
  PostingResult,
  SupportedPlatforms
} from './types';
import {
  MastodonPlatform,
  BlueskyPlatform,
  DiscordPlatform,
  RedditPlatform,
  DevtoPlatform,
  MediumPlatform,
  BasePlatform
} from './platforms';
import * as crypto from 'crypto';
import { prisma } from './database';

export class HyperPost {
  private platforms: Map<string, BasePlatform> = new Map();
  private duplicateCheckWindow: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(credentials: PlatformCredentials) {
    this.initializePlatforms(credentials);
    this.initializeDatabase();
  }

  /**
   * Initialize database tables and ensure platforms exist
   */
  private async initializeDatabase(): Promise<void> {
    try {
      // Ensure platforms exist in database
      const platformData = [
        { name: 'mastodon', displayName: 'Mastodon' },
        { name: 'bluesky', displayName: 'Bluesky' },
        { name: 'reddit', displayName: 'Reddit' },
        { name: 'discord', displayName: 'Discord' },
        { name: 'devto', displayName: 'Dev.to' },
        { name: 'medium', displayName: 'Medium' }
      ];

      for (const platform of platformData) {
        await prisma.platform.upsert({
          where: { name: platform.name },
          update: { displayName: platform.displayName },
          create: platform
        });
      }
    } catch (error) {
      console.warn('Database initialization warning:', error);
      // Continue without database - fallback to in-memory tracking
    }
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: SocialPost): string {
    const contentString = `${content.title || ''}|${content.content}|${content.url || ''}`;
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }

  /**
   * Check if content has been posted recently to a specific platform
   */
  private async isDuplicate(content: SocialPost, platformName: string): Promise<{ isDuplicate: boolean; postedTo: string[]; lastPosted?: Date }> {
    try {
      const contentHash = this.generateContentHash(content);
      const cutoffTime = new Date(Date.now() - this.duplicateCheckWindow);

      // Find the post in database
      const post = await prisma.post.findUnique({
        where: { contentHash },
        include: {
          postPlatforms: {
            where: {
              postedAt: { gte: cutoffTime },
              platform: { name: platformName }
            },
            include: {
              platform: true
            }
          }
        }
      });

      if (!post) {
        return { isDuplicate: false, postedTo: [] };
      }

      // Check if it was posted to this specific platform recently
      const postedToThisPlatform = post.postPlatforms.length > 0;
      const postedTo = post.postPlatforms.map((pp: any) => pp.platform.name);

      return {
        isDuplicate: postedToThisPlatform,
        postedTo,
        lastPosted: post.postPlatforms[0]?.postedAt
      };
    } catch (error) {
      console.warn('Database query failed, falling back to allowing post:', error);
      return { isDuplicate: false, postedTo: [] };
    }
  }

  /**
   * Record a successful post
   */
  private async recordPost(content: SocialPost, platformName: string, result: PostingResult): Promise<void> {
    if (!result.success || !result.url) return;

    try {
      const contentHash = this.generateContentHash(content);

      // Get or create the platform
      const platform = await prisma.platform.findUnique({
        where: { name: platformName }
      });

      if (!platform) {
        console.warn(`Platform ${platformName} not found in database`);
        return;
      }

      // Create or update the post
      const post = await prisma.post.upsert({
        where: { contentHash },
        update: {
          title: content.title,
          content: content.content,
          url: content.url
        },
        create: {
          contentHash,
          title: content.title,
          content: content.content,
          url: content.url
        }
      });

      // Create the post-platform relationship
      await prisma.postPlatform.create({
        data: {
          postId: post.id,
          platformId: platform.id,
          postUrl: result.url
        }
      });

    } catch (error) {
      console.warn('Failed to record post in database:', error);
    }
  }

  private initializePlatforms(credentials: PlatformCredentials): void {
    // Mastodon
    if (credentials.mastodon) {
      this.platforms.set('mastodon', new MastodonPlatform(credentials.mastodon));
    }

    // Bluesky
    if (credentials.bluesky) {
      this.platforms.set('bluesky', new BlueskyPlatform(credentials.bluesky));
    }

    // Discord
    if (credentials.discord) {
      this.platforms.set('discord', new DiscordPlatform(credentials.discord));
    }

    // Reddit
    if (credentials.reddit) {
      this.platforms.set('reddit', new RedditPlatform(credentials.reddit));
    }

    // Dev.to
    if (credentials.devto) {
      this.platforms.set('devto', new DevtoPlatform(credentials.devto));
    }

    // Medium
    if (credentials.medium) {
      this.platforms.set('medium', new MediumPlatform(credentials.medium));
    }
  }

  /**
   * Post to a single platform
   */
  async postToPlatform(platform: SupportedPlatforms, content: SocialPost): Promise<PostingResult> {
    const platformInstance = this.platforms.get(platform);

    if (!platformInstance) {
      return {
        platform,
        success: false,
        error: `Platform ${platform} not configured or credentials missing`
      };
    }

    // Check for duplicates
    const duplicateCheck = await this.isDuplicate(content, platform);
    if (duplicateCheck.isDuplicate) {
      const lastPosted = duplicateCheck.lastPosted ?
        ` (last posted: ${duplicateCheck.lastPosted.toLocaleString()})` : '';
      return {
        platform,
        success: false,
        error: `Duplicate content: This post was already sent to ${platform} recently${lastPosted}. Previously posted to: ${duplicateCheck.postedTo.join(', ')}`
      };
    }

    const result = await platformInstance.post(content);

    // Record successful posts
    await this.recordPost(content, platform, result);

    return result;
  }

  /**
   * Post to all configured platforms
   */
  async postToAll(content: SocialPost): Promise<MultiPlatformResult> {
    const results: PostingResult[] = [];
    let successful = 0;
    let failed = 0;

    const promises = Array.from(this.platforms.entries()).map(async ([name, platform]) => {
      const result = await this.postToPlatform(name as SupportedPlatforms, content);
      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    });

    await Promise.allSettled(promises);

    return {
      results,
      successful,
      failed
    };
  }

  /**
   * Post to specific platforms
   */
  async postToPlatforms(platforms: SupportedPlatforms[], content: SocialPost): Promise<MultiPlatformResult> {
    const results: PostingResult[] = [];
    let successful = 0;
    let failed = 0;

    const promises = platforms.map(async (platformName) => {
      const result = await this.postToPlatform(platformName, content);
      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    });

    await Promise.allSettled(promises);

    return {
      results,
      successful,
      failed
    };
  }

  /**
   * Get posted content history
   */
  async getPostedContentHistory(limit: number = 50): Promise<any[]> {
    try {
      const posts = await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          postPlatforms: {
            include: {
              platform: true
            }
          }
        }
      });

      return posts.map((post: any) => ({
        contentHash: post.contentHash,
        title: post.title,
        content: post.content,
        url: post.url,
        platforms: post.postPlatforms.map((pp: any) => pp.platform.name),
        timestamp: post.createdAt.getTime(),
        postUrls: post.postPlatforms.map((pp: any) => ({
          platform: pp.platform.name,
          url: pp.postUrl,
          postedAt: pp.postedAt
        }))
      }));
    } catch (error) {
      console.warn('Failed to fetch posting history:', error);
      return [];
    }
  }

  /**
   * Clear posted content history
   */
  async clearPostedContentHistory(): Promise<void> {
    try {
      await prisma.postPlatform.deleteMany();
      await prisma.post.deleteMany();
      console.log('✅ Posting history cleared from database.');
    } catch (error) {
      console.warn('Failed to clear posting history:', error);
    }
  }

  /**
   * Get posting analytics
   */
  async getPostingAnalytics(platform?: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analytics = await prisma.postPlatform.findMany({
        where: {
          postedAt: { gte: startDate },
          ...(platform && {
            platform: { name: platform }
          })
        },
        include: {
          platform: true,
          post: true,
          analytics: true
        },
        orderBy: { postedAt: 'desc' }
      });

      return {
        totalPosts: analytics.length,
        byPlatform: analytics.reduce((acc: Record<string, number>, item: any) => {
          acc[item.platform.name] = (acc[item.platform.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentPosts: analytics.slice(0, 10),
        engagementData: analytics.map((item: any) => ({
          platform: item.platform.name,
          postTitle: item.post.title,
          url: item.postUrl,
          postedAt: item.postedAt,
          metrics: item.analytics.reduce((acc: Record<string, number>, metric: any) => {
            acc[metric.metric] = metric.value;
            return acc;
          }, {} as Record<string, number>)
        }))
      };
    } catch (error) {
      console.warn('Failed to fetch analytics:', error);
      return { totalPosts: 0, byPlatform: {}, recentPosts: [], engagementData: [] };
    }
  }

  /**
   * Gather analytics for all posts
   */
  async gatherAnalyticsForAllPosts(): Promise<any> {
    try {
      const results: any[] = [];
      let totalProcessed = 0;
      let totalUpdated = 0;

      // Get all post platforms that need analytics updates (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const postPlatforms = await prisma.postPlatform.findMany({
        where: {
          analytics: {
            none: {
              recordedAt: { gte: oneHourAgo }
            }
          }
        },
        include: {
          platform: true
        }
      });

      for (const postPlatform of postPlatforms) {
        try {
          const platformInstance = this.platforms.get(postPlatform.platform.name);
          if (!platformInstance) continue;

          totalProcessed++;
          const analytics = await platformInstance.gatherAnalytics(postPlatform.postUrl!);

          // Store analytics in database (even if 0, to track that we gathered them)
          for (const [metric, value] of Object.entries(analytics)) {
            if (value !== undefined) {
              await prisma.postAnalytics.upsert({
                where: {
                  postPlatformId_metric: {
                    postPlatformId: postPlatform.id,
                    metric
                  }
                },
                update: {
                  value: value || 0,
                  recordedAt: new Date() // Update timestamp when we refresh analytics
                },
                create: {
                  postPlatformId: postPlatform.id,
                  metric,
                  value: value || 0
                }
              });
            }
          }

          results.push({
            platform: postPlatform.platform.name,
            url: postPlatform.postUrl,
            analytics,
            success: true
          });

          totalUpdated++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          results.push({
            platform: postPlatform.platform.name,
            url: postPlatform.postUrl,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          });
        }
      }

      return {
        processed: totalProcessed,
        updated: totalUpdated,
        results
      };

    } catch (error) {
      console.warn('Failed to gather analytics for posts:', error);
      return { processed: 0, updated: 0, results: [] };
    }
  }

  /**
   * Set duplicate check window (in hours)
   */
  setDuplicateCheckWindow(hours: number): void {
    this.duplicateCheckWindow = hours * 60 * 60 * 1000;
  }

  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms(): string[] {
    return Array.from(this.platforms.keys());
  }

  /**
   * Check if a platform is configured
   */
  isPlatformConfigured(platform: SupportedPlatforms): boolean {
    return this.platforms.has(platform);
  }

  /**
   * Get a specific platform instance
   */
  getPlatform(platformName: string): BasePlatform | undefined {
    return this.platforms.get(platformName);
  }
}

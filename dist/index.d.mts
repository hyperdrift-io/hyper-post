interface SocialPost {
    content: string;
    title?: string;
    url?: string;
    imageUrl?: string;
    tags?: string[];
}
interface PlatformCredentials {
    [key: string]: Record<string, string>;
}
interface PlatformConfig {
    name: string;
    displayName: string;
    enabled: boolean;
    credentials: Record<string, string>;
}
interface PostingResult {
    platform: string;
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
}
interface MultiPlatformResult {
    results: PostingResult[];
    successful: number;
    failed: number;
}
type SupportedPlatforms = 'mastodon' | 'bluesky' | 'threads' | 'discord' | 'reddit' | 'hackernews' | 'devto' | 'medium' | 'tumblr' | 'pinterest';

interface PostAnalytics {
    likes?: number;
    reposts?: number;
    replies?: number;
    views?: number;
    bookmarks?: number;
    [key: string]: number | undefined;
}
declare abstract class BasePlatform {
    protected credentials: Record<string, string>;
    constructor(credentials: Record<string, string>);
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
    abstract discoverPosts(limit?: number): Promise<Array<{
        url: string;
        content: string;
        createdAt: Date;
        analytics: PostAnalytics;
    }>>;
    validateCredentials(): void;
    protected abstract getRequiredCredentials(): string[];
    protected createResult(success: boolean, postId?: string, url?: string, error?: string): PostingResult;
}

declare class MastodonPlatform extends BasePlatform {
    get name(): string;
    get displayName(): string;
    protected getRequiredCredentials(): string[];
    post(content: SocialPost): Promise<PostingResult>;
    gatherAnalytics(postUrl: string): Promise<PostAnalytics>;
    /**
     * Discover recent posts from the user's account
     */
    discoverPosts(limit?: number): Promise<Array<{
        url: string;
        content: string;
        createdAt: Date;
        analytics: PostAnalytics;
    }>>;
}

declare class BlueskyPlatform extends BasePlatform {
    private agent;
    constructor(credentials: Record<string, string>);
    get name(): string;
    get displayName(): string;
    protected getRequiredCredentials(): string[];
    post(content: SocialPost): Promise<PostingResult>;
    gatherAnalytics(postUrl: string): Promise<PostAnalytics>;
    /**
     * Discover recent posts from the user's account
     */
    discoverPosts(limit?: number): Promise<Array<{
        url: string;
        content: string;
        createdAt: Date;
        analytics: PostAnalytics;
    }>>;
}

declare class DiscordPlatform extends BasePlatform {
    private client;
    constructor(credentials: Record<string, string>);
    get name(): string;
    get displayName(): string;
    protected getRequiredCredentials(): string[];
    post(content: SocialPost): Promise<PostingResult>;
    gatherAnalytics(postUrl: string): Promise<PostAnalytics>;
    /**
     * Discover recent posts from the user's account (not well supported by Discord API)
     */
    discoverPosts(limit?: number): Promise<Array<{
        url: string;
        content: string;
        createdAt: Date;
        analytics: PostAnalytics;
    }>>;
}

declare class HyperPost {
    private platforms;
    private duplicateCheckWindow;
    constructor(credentials: PlatformCredentials);
    /**
     * Initialize database tables and ensure platforms exist
     */
    private initializeDatabase;
    /**
     * Generate content hash for deduplication
     */
    private generateContentHash;
    /**
     * Check if content has been posted recently to a specific platform
     */
    private isDuplicate;
    /**
     * Record a successful post
     */
    private recordPost;
    private initializePlatforms;
    /**
     * Post to a single platform
     */
    postToPlatform(platform: SupportedPlatforms, content: SocialPost): Promise<PostingResult>;
    /**
     * Post to all configured platforms
     */
    postToAll(content: SocialPost): Promise<MultiPlatformResult>;
    /**
     * Post to specific platforms
     */
    postToPlatforms(platforms: SupportedPlatforms[], content: SocialPost): Promise<MultiPlatformResult>;
    /**
     * Get posted content history
     */
    getPostedContentHistory(limit?: number): Promise<any[]>;
    /**
     * Clear posted content history
     */
    clearPostedContentHistory(): Promise<void>;
    /**
     * Get posting analytics
     */
    getPostingAnalytics(platform?: string, days?: number): Promise<any>;
    /**
     * Gather analytics for all posts
     */
    gatherAnalyticsForAllPosts(): Promise<any>;
    /**
     * Set duplicate check window (in hours)
     */
    setDuplicateCheckWindow(hours: number): void;
    /**
     * Get list of configured platforms
     */
    getConfiguredPlatforms(): string[];
    /**
     * Check if a platform is configured
     */
    isPlatformConfigured(platform: SupportedPlatforms): boolean;
    /**
     * Get a specific platform instance
     */
    getPlatform(platformName: string): BasePlatform | undefined;
}

export { BlueskyPlatform, DiscordPlatform, HyperPost, MastodonPlatform, type MultiPlatformResult, type PlatformConfig, type PlatformCredentials, type PostingResult, type SocialPost, type SupportedPlatforms };

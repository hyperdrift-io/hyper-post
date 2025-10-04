export interface SocialPost {
  content: string;
  title?: string;
  url?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface PlatformCredentials {
  [key: string]: Record<string, string>;
}

export interface PlatformConfig {
  name: string;
  displayName: string;
  enabled: boolean;
  credentials: Record<string, string>;
}

export interface PostingResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export interface MultiPlatformResult {
  results: PostingResult[];
  successful: number;
  failed: number;
}

export type SupportedPlatforms =
  | 'mastodon'
  | 'bluesky'
  | 'threads'
  | 'discord'
  | 'reddit'
  | 'hackernews'
  | 'devto'
  | 'medium'
  | 'tumblr'
  | 'pinterest';

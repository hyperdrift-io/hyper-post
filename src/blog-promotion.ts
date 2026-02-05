/**
 * Blog Promotion Utilities
 *
 * Parses MDX blog posts from a content directory and generates
 * social media posts for promotion via hyper-post.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author?: string;
  filePath: string;
}

export interface SocialPromotion {
  title: string;
  content: string;
  url: string;
  tags: string[];
  metadata: BlogPostMetadata;
}

/**
 * Parse frontmatter from MDX content
 */
function parseFrontmatter(content: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const frontmatter = match[1];
  const body = match[2];

  // Simple YAML parser for frontmatter
  const data: Record<string, any> = {};
  const lines = frontmatter.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      data[key] = arrayContent.split(',').map(item => {
        item = item.trim();
        if ((item.startsWith('"') && item.endsWith('"')) ||
            (item.startsWith("'") && item.endsWith("'"))) {
          return item.slice(1, -1);
        }
        return item;
      });
    } else {
      data[key] = value;
    }
  }

  return { data, content: body };
}

/**
 * Read all blog posts from a directory
 */
export function readBlogPosts(contentDir: string): BlogPostMetadata[] {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }

  const files = fs.readdirSync(contentDir);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));

  const posts: BlogPostMetadata[] = [];

  for (const fileName of mdxFiles) {
    const filePath = path.join(contentDir, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = parseFrontmatter(fileContent);

    const slug = fileName.replace('.mdx', '');

    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author,
      filePath
    });
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(contentDir: string, slug: string): BlogPostMetadata | null {
  const posts = readBlogPosts(contentDir);
  return posts.find(p => p.slug === slug) || null;
}

/**
 * Generate a social media promotion for a blog post
 */
export function generatePromotion(
  post: BlogPostMetadata,
  baseUrl: string,
  options: {
    includeExcerpt?: boolean;
    maxContentLength?: number;
    customMessage?: string;
  } = {}
): SocialPromotion {
  const {
    includeExcerpt = true,
    maxContentLength = 280,
    customMessage
  } = options;

  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Build the content
  let content: string;

  if (customMessage) {
    content = customMessage;
  } else if (includeExcerpt && post.excerpt) {
    content = post.excerpt;
  } else {
    content = `New article: ${post.title}`;
  }

  // Truncate if needed (leave room for URL)
  if (content.length > maxContentLength - 30) {
    content = content.substring(0, maxContentLength - 33) + '...';
  }

  return {
    title: post.title,
    content,
    url: postUrl,
    tags: post.tags.slice(0, 5), // Limit to 5 tags for platform compatibility
    metadata: post
  };
}

/**
 * Generate promotions for multiple posts
 */
export function generatePromotions(
  posts: BlogPostMetadata[],
  baseUrl: string,
  options: Parameters<typeof generatePromotion>[2] = {}
): SocialPromotion[] {
  return posts.map(post => generatePromotion(post, baseUrl, options));
}

/**
 * Get recent posts that haven't been promoted yet
 * (Based on date - posts from the last N days)
 */
export function getRecentUnpromotedPosts(
  contentDir: string,
  daysOld: number = 7
): BlogPostMetadata[] {
  const posts = readBlogPosts(contentDir);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return posts.filter(post => new Date(post.date) >= cutoffDate);
}

/**
 * Format a promotion for CLI display
 */
export function formatPromotionPreview(promo: SocialPromotion): string {
  const lines = [
    `📝 ${promo.title}`,
    `📅 ${new Date(promo.metadata.date).toLocaleDateString()}`,
    `🔗 ${promo.url}`,
    `🏷️  ${promo.tags.join(', ')}`,
    '',
    `Content: ${promo.content}`,
    ''
  ];
  return lines.join('\n');
}

/**
 * Platform-specific content formatters
 */
export const platformFormatters = {
  /**
   * Format for short-form platforms (Mastodon, Bluesky)
   */
  shortForm(promo: SocialPromotion): { title?: string; content: string; url: string; tags: string[] } {
    return {
      content: promo.content,
      url: promo.url,
      tags: promo.tags
    };
  },

  /**
   * Format for Dev.to (full article cross-post)
   */
  devto(promo: SocialPromotion, fullContent?: string): { title: string; content: string; url: string; tags: string[] } {
    // For Dev.to, we want the full article content if available
    const content = fullContent || promo.content;

    return {
      title: promo.title,
      content: content + `\n\n---\n\n*Originally published at [${promo.url}](${promo.url})*`,
      url: promo.url, // canonical_url
      tags: promo.tags.slice(0, 4) // Dev.to allows 4 tags
    };
  },

  /**
   * Format for Medium (long-form with proper formatting)
   */
  medium(promo: SocialPromotion, fullContent?: string): { title: string; content: string; url: string; tags: string[] } {
    const content = fullContent || promo.content;

    return {
      title: promo.title,
      content: content,
      url: promo.url, // canonical_url
      tags: promo.tags.slice(0, 5) // Medium allows 5 tags
    };
  }
};

export default {
  readBlogPosts,
  getBlogPostBySlug,
  generatePromotion,
  generatePromotions,
  getRecentUnpromotedPosts,
  formatPromotionPreview,
  platformFormatters
};

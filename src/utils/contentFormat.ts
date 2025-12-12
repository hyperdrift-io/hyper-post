import { compile } from '@mdx-js/mdx';
import { remark } from 'remark';
import remarkStringify from 'remark-stringify';

export enum ContentFormat {
  MARKDOWN = 'markdown',
  MDX = 'mdx',
  UNKNOWN = 'unknown'
}

/**
 * Detect the content format based on syntax patterns
 */
export function detectContentFormat(content: string): ContentFormat {
  // Check for MDX indicators first (more specific)
  if (hasMdxIndicators(content)) {
    return ContentFormat.MDX;
  }

  // Check for Markdown indicators
  if (hasMarkdownIndicators(content)) {
    return ContentFormat.MARKDOWN;
  }

  return ContentFormat.UNKNOWN;
}

/**
 * Check if content has MDX-specific syntax
 */
function hasMdxIndicators(content: string): boolean {
  // Look for JSX elements (opening tags)
  const jsxElementRegex = /<\w+[^>]*>/;
  if (jsxElementRegex.test(content)) {
    return true;
  }

  // Look for import/export statements (common in MDX)
  const importRegex = /^\s*(import|export)\s+/m;
  if (importRegex.test(content)) {
    return true;
  }

  // Look for JSX expressions {expression}
  const jsxExpressionRegex = /\{[^}]*\}/;
  if (jsxExpressionRegex.test(content)) {
    return true;
  }

  return false;
}

/**
 * Check if content has Markdown-specific syntax
 */
function hasMarkdownIndicators(content: string): boolean {
  // Look for common markdown elements
  const markdownPatterns = [
    /^#{1,6}\s/m,  // Headers
    /\[.*?\]\(.*?\)/,  // Links
    /\*\*.*?\*\*/,  // Bold
    /\*.*?\*/,  // Italic
    /`.*?`/,  // Inline code
    /```[\s\S]*?```/,  // Code blocks
    /^\s*[-*+]\s/m,  // List items
    /^\s*\d+\.\s/m,  // Numbered list items
    /^>\s/m,  // Blockquotes
    /!\[.*?\]\(.*?\)/,  // Images
  ];

  // Count how many markdown patterns are found
  let markdownMatches = 0;
  for (const pattern of markdownPatterns) {
    if (pattern.test(content)) {
      markdownMatches++;
    }
  }

  // If we find at least 2 markdown patterns, consider it markdown
  return markdownMatches >= 2;
}

/**
 * Convert MDX content to Markdown
 */
export async function convertMdxToMarkdown(content: string): Promise<string> {
  try {
    // Use MDX compiler to parse and convert to markdown
    const result = await compile(content, {
      outputFormat: 'md',
      remarkPlugins: [],
      rehypePlugins: []
    });

    // Convert the compiled result back to string
    const markdownContent = String(result);

    return markdownContent;
  } catch (error) {
    // Fallback: try to remove JSX elements manually
    console.warn('MDX compilation failed, attempting manual cleanup:', error);

    // Remove JSX elements
    let cleaned = content.replace(/<[^>]+>/g, '');

    // Remove import/export statements
    cleaned = cleaned.replace(/^\s*(import|export).*?$/gm, '');

    // Remove empty lines that were left behind
    cleaned = cleaned.replace(/^\s*$/gm, '').trim();

    return cleaned;
  }
}

/**
 * Validate that content is in a Medium-compatible format
 * Throws an error if content is not Markdown or MDX
 */
export async function validateAndPrepareContentForMedium(content: string): Promise<string> {
  const format = detectContentFormat(content);

  switch (format) {
    case ContentFormat.MARKDOWN:
      // Already in correct format
      return content;

    case ContentFormat.MDX:
      // Convert MDX to Markdown
      console.log('🔄 Converting MDX content to Markdown for Medium...');
      const markdown = await convertMdxToMarkdown(content);
      console.log('✅ MDX conversion completed');
      return markdown;

    case ContentFormat.UNKNOWN:
    default:
      throw new Error(
        `Medium platform requires content in Markdown format. ` +
        `Detected content format: ${format}. ` +
        `Please provide content in Markdown (.md) or MDX (.mdx) format.`
      );
  }
}

/**
 * Extract hashtags from content
 */
export function extractHashtagsFromContent(content: string): string[] {
  // Match hashtags that are standalone or at the end of lines
  // This regex looks for # followed by word characters, allowing for hyphens, underscores, and spaces in multi-word hashtags
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9\s_-]*?)(?=\s|$|[^a-zA-Z0-9\s_-])/g;

  const hashtags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const tag = match[1].trim().toLowerCase().replace(/[\s_-]+/g, '-'); // Normalize spaces and underscores to hyphens
    if (tag.length > 0 && tag.length <= 25) { // Medium tag limit
      hashtags.push(tag);
    }
  }

  return [...new Set(hashtags)]; // Remove duplicates
}

/**
 * Process and validate tags for Medium
 * Medium allows up to 5 tags, each up to 25 characters
 */
export function processTagsForMedium(explicitTags: string[] = [], content: string): string[] {
  // Extract hashtags from content
  const extractedTags = extractHashtagsFromContent(content);

  // Combine explicit tags with extracted tags
  const allTags = [...explicitTags, ...extractedTags];

  // Normalize tags: lowercase, trim, remove duplicates
  const normalizedTags = allTags
    .map(tag => tag.toLowerCase().trim())
    .filter(tag => tag.length > 0 && tag.length <= 25)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

  // Medium allows maximum 5 tags
  const finalTags = normalizedTags.slice(0, 5);

  if (normalizedTags.length > 5) {
    console.warn(`⚠️ Medium allows maximum 5 tags. Using first 5: ${finalTags.join(', ')}`);
  }

  return finalTags;
}

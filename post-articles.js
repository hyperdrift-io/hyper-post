#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory containing blog articles
const BLOG_DIR = path.join(__dirname, '../../content/blog');

// Function to parse frontmatter and content
function parseArticle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find frontmatter
  let frontmatterStart = -1;
  let frontmatterEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (frontmatterStart === -1) {
        frontmatterStart = i;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
  }

  if (frontmatterStart === -1 || frontmatterEnd === -1) {
    throw new Error(`Invalid frontmatter in ${filePath}`);
  }

  // Parse frontmatter
  const frontmatter = lines.slice(frontmatterStart + 1, frontmatterEnd).join('\n');
  const frontmatterObj = {};

  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key === 'tags') {
        // Parse tags array
        frontmatterObj[key] = value.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim());
      } else {
        frontmatterObj[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  });

  // Get content after frontmatter
  const articleContent = lines.slice(frontmatterEnd + 1).join('\n').trim();

  return {
    title: frontmatterObj.title,
    excerpt: frontmatterObj.excerpt,
    tags: frontmatterObj.tags || [],
    content: articleContent,
    url: `https://hyperdrift.io/blog/${path.basename(filePath, '.mdx')}`
  };
}

// Function to post article
function postArticle(article) {
  console.log(`\n📝 Posting: "${article.title}"`);
  console.log(`🏷️  Tags: ${article.tags.join(', ')}`);

  // Prepare content for posting (truncate if too long)
  let postContent = article.excerpt || article.content;

  // Bluesky has a strict 300 character limit, Mastodon allows 500
  // For Bluesky, be more aggressive with truncation
  const maxLength = 250; // Leave room for URL and tags
  if (postContent.length > maxLength) {
    // Try to find a natural break point (sentence end)
    let truncated = postContent.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSentence > maxLength * 0.7) {
      truncated = truncated.substring(0, lastSentence + 1);
    } else if (lastSpace > maxLength * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    } else {
      truncated = truncated.substring(0, maxLength - 3) + '...';
    }
    postContent = truncated;
  }

  // Add URL
  postContent += `\n\n${article.url}`;

  // Add tags
  if (article.tags.length > 0) {
    const tagString = article.tags.map(tag => `#${tag}`).join(' ');
    postContent += `\n\n${tagString}`;
  }

  // Create the command
  const title = `"${article.title}"`;
  const content = `"${postContent.replace(/"/g, '\\"')}"`;
  const platforms = 'mastodon,bluesky';

  const command = `node dist/cli.js post -t ${title} -c ${content} -p ${platforms}`;

  try {
    console.log(`🚀 Executing: ${command}`);
    const result = execSync(command, {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log(`✅ Successfully posted: "${article.title}"`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to post: "${article.title}"`);
    console.error(error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 HyperPost: Posting all blog articles to Mastodon & Bluesky\n');

  // Get all .mdx files (excluding README.md)
  const files = fs.readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.mdx') && file !== 'README.md')
    .map(file => path.join(BLOG_DIR, file));

  console.log(`📚 Found ${files.length} articles to post:\n`);

  files.forEach((file, index) => {
    const filename = path.basename(file, '.mdx');
    console.log(`${index + 1}. ${filename}`);
  });

  console.log('\n⏳ Starting posts...\n');

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const article = parseArticle(file);
      const success = postArticle(article);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between posts to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Posting complete!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total articles: ${files.length}`);
}

// Run the script
main().catch(console.error);

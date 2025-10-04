import { Command } from 'commander';
import { config } from 'dotenv';
import { HyperPost } from './HyperPost';
import { SocialPost } from './types';
import { SignupManager } from './signup-manager';
import { prisma } from './database';
import * as crypto from 'crypto';

// Load environment variables
config();

const program = new Command();

program
  .name('hyper-post')
  .description('A unified social media posting tool for underground platforms')
  .version('0.1.0');

program
  .command('post')
  .description('Post content to social media platforms')
  .requiredOption('-c, --content <content>', 'Post content')
  .option('-t, --title <title>', 'Post title')
  .option('-u, --url <url>', 'URL to include')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (defaults to all configured)')
  .option('--dry-run', 'Preview the post without actually posting (recommended for testing)')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      const post: SocialPost = {
        content: options.content,
        title: options.title,
        url: options.url,
        tags: options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : undefined
      };

      if (options.dryRun) {
        console.log('🔍 Dry run mode - previewing post:');
        console.log('=' .repeat(50));
        console.log(`Content: ${post.content}`);
        if (post.title) console.log(`Title: ${post.title}`);
        if (post.url) console.log(`URL: ${post.url}`);
        if (post.tags) console.log(`Tags: ${post.tags.join(', ')}`);
        console.log('');

        let targetPlatforms: string[];
        if (options.platforms) {
          targetPlatforms = options.platforms.split(',').map((p: string) => p.trim());
          // Validate that specified platforms are configured
          const configuredPlatforms = hyperPost.getConfiguredPlatforms();
          const invalidPlatforms = targetPlatforms.filter(p => !configuredPlatforms.includes(p));
          if (invalidPlatforms.length > 0) {
            console.error(`❌ Invalid platforms: ${invalidPlatforms.join(', ')}`);
            console.error(`Configured platforms: ${configuredPlatforms.join(', ')}`);
            process.exit(1);
          }
        } else {
          targetPlatforms = hyperPost.getConfiguredPlatforms();
        }

        console.log(`Will post to: ${targetPlatforms.join(', ')}`);
        console.log('');
        console.log('💡 Remove --dry-run to actually post');
        return;
      }

      let result;

      if (options.platforms) {
        const platforms = options.platforms.split(',').map((p: string) => p.trim());
        result = await hyperPost.postToPlatforms(platforms as any, post);
      } else {
        result = await hyperPost.postToAll(post);
      }

      console.log('📤 Posting results:');
      console.log(`✅ Successful: ${result.successful}`);
      console.log(`❌ Failed: ${result.failed}`);
      console.log('');

      result.results.forEach(r => {
        if (r.success) {
          console.log(`✅ ${r.platform}: ${r.url || 'Posted successfully'}`);
        } else {
          console.log(`❌ ${r.platform}: ${r.error}`);
        }
      });

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('platforms')
  .description('List configured platforms')
  .action(() => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      const platforms = hyperPost.getConfiguredPlatforms();

      if (platforms.length === 0) {
        console.log('No platforms configured. Check your .env file or run setup.');
        console.log('Run "hyper-post setup" to configure platforms interactively.');
      } else {
        console.log('Configured platforms:');
        platforms.forEach(platform => {
          console.log(`- ${platform}`);
        });
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Interactive setup wizard for configuring social media platforms')
  .action(async () => {
    // Import and run setup
    const { HyperPostSetup } = await import('./setup');
    const setup = new HyperPostSetup();
    await setup.run();
  });

function loadCredentials(): any {
  const credentials: any = {};

  // First load from SignupManager (persistent data)
  const signupManager = new SignupManager();
  const completedAccounts = signupManager.getAllCompletedAccounts();

  for (const [platform, accountData] of Object.entries(completedAccounts)) {
    credentials[platform] = accountData;
  }

  // Then load/override from environment variables (.env file)
  // Mastodon
  if (process.env.MASTODON_INSTANCE && process.env.MASTODON_ACCESS_TOKEN) {
    credentials.mastodon = {
      instance: process.env.MASTODON_INSTANCE,
      accessToken: process.env.MASTODON_ACCESS_TOKEN
    };
  }

  // Bluesky
  if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD) {
    credentials.bluesky = {
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD
    };
  }

  // Discord - disabled due to rate limiting
  if (process.env.DISCORD_DISABLED !== 'true' &&
      process.env.DISCORD_TOKEN && process.env.DISCORD_CHANNEL_ID) {
    credentials.discord = {
      token: process.env.DISCORD_TOKEN,
      channelId: process.env.DISCORD_CHANNEL_ID
    };
  }

  // Dev.to
  if (process.env.DEVTO_API_KEY) {
    credentials.devto = {
      apiKey: process.env.DEVTO_API_KEY
    };
  }

  // Medium
  if (process.env.MEDIUM_TOKEN) {
    credentials.medium = {
      integrationToken: process.env.MEDIUM_TOKEN
    };
  }

  // Reddit - disabled due to network connectivity issues
  if (process.env.REDDIT_DISABLED !== 'true' &&
      process.env.REDDIT_CLIENTID && process.env.REDDIT_CLIENTSECRET &&
      process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD) {
    credentials.reddit = {
      clientId: process.env.REDDIT_CLIENTID,
      clientSecret: process.env.REDDIT_CLIENTSECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
      subreddit: process.env.REDDIT_SUBREDDIT
    };
  }

  return credentials;
}

program
  .command('history')
  .description('Show posting history and check for duplicates')
  .option('--clear', 'Clear the posting history')
  .option('--platform <platform>', 'Filter history by platform')
  .option('--limit <number>', 'Limit number of results', '50')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      if (options.clear) {
        await hyperPost.clearPostedContentHistory();
        return;
      }

      const history = await hyperPost.getPostedContentHistory(parseInt(options.limit) || 50);

      if (history.length === 0) {
        console.log('No posting history found.');
        return;
      }

      let filteredHistory = history;
      if (options.platform) {
        filteredHistory = history.filter(item => item.platforms.includes(options.platform));
      }

      console.log(`📚 Posting History (${filteredHistory.length} entries):`);
      console.log('=' .repeat(60));

      filteredHistory.forEach((item, index) => {
        const date = new Date(item.timestamp).toLocaleString();
        console.log(`${index + 1}. [${date}]`);
        console.log(`   Platforms: ${item.platforms.join(', ')}`);
        if (item.title) console.log(`   Title: ${item.title}`);
        console.log(`   Content: ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}`);
        if (item.postUrls && item.postUrls.length > 0) {
          console.log(`   URLs:`);
          item.postUrls.forEach((url: any) => {
            console.log(`     ${url.platform}: ${url.url}`);
          });
        }
        console.log(`   Hash: ${item.contentHash.substring(0, 16)}...`);
        console.log('');
      });

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('analytics')
  .description('Show posting analytics (cached data from database)')
  .option('--platform <platform>', 'Filter analytics by platform')
  .option('--days <number>', 'Number of days to analyze', '30')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      const analytics = await hyperPost.getPostingAnalytics(
        options.platform,
        parseInt(options.days) || 30
      );

      console.log(`📊 Posting Analytics (${options.days} days - cached data):`);
      console.log('=' .repeat(60));
      console.log(`Total Posts: ${analytics.totalPosts}`);
      console.log('');

      if (Object.keys(analytics.byPlatform).length > 0) {
        console.log('Posts by Platform:');
        Object.entries(analytics.byPlatform).forEach(([platform, count]) => {
          console.log(`  ${platform}: ${count}`);
        });
        console.log('');
      }

      if (analytics.recentPosts.length > 0) {
        console.log('Recent Posts:');
        analytics.recentPosts.slice(0, 5).forEach((post: any, index: number) => {
          const date = post.postedAt.toLocaleString();
          console.log(`${index + 1}. [${date}] ${post.platform.name}: ${post.post.title || post.post.content.substring(0, 50)}...`);
        });
        console.log('');
      }

      if (analytics.engagementData.length > 0) {
        console.log('Engagement Data (likes, reposts, etc.):');
        analytics.engagementData.slice(0, 5).forEach((item: any, index: number) => {
          const metrics = Object.entries(item.metrics)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          console.log(`${index + 1}. ${item.platform}: ${metrics || 'No engagement data'} - ${item.postTitle || 'Untitled'}`);
        });
      }

      console.log('');
      console.log('💡 Tip: Use "hyper-post gather-analytics" to fetch fresh engagement data from platforms!');

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('');
      console.log('💡 Tip: Make sure your DATABASE_URL is properly configured for PostgreSQL.');
      process.exit(1);
    }
  });

program
  .command('gather-analytics')
  .description('Fetch fresh engagement metrics (likes/faves/reposts) from all platforms')
  .action(async () => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      console.log('🔍 Gathering fresh analytics from platforms...');
      console.log('This fetches likes, reposts, replies, and other engagement data.');
      console.log('This may take a while depending on the number of posts.');
      console.log('');

      const results = await hyperPost.gatherAnalyticsForAllPosts();

      console.log(`📊 Analytics Gathering Complete:`);
      console.log('=' .repeat(50));
      console.log(`Posts Processed: ${results.processed}`);
      console.log(`Posts Updated: ${results.updated}`);
      console.log('');

      if (results.results.length > 0) {
        console.log('Results:');
        results.results.forEach((result: any, index: number) => {
          if (result.success) {
            const metrics = Object.entries(result.analytics)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            console.log(`✅ ${result.platform}: ${metrics || 'No engagement data'}`);
          } else {
            console.log(`❌ ${result.platform}: ${result.error}`);
          }
        });
      }

      console.log('');
      console.log('💡 Tip: Run "hyper-post analytics" to see updated engagement data!');

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('discover-posts')
  .description('Discover existing posts on platforms with their analytics')
  .option('--platform <platform>', 'Limit discovery to specific platform')
  .option('--limit <number>', 'Number of posts to discover per platform', '10')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      console.log('🔍 Discovering posts on platforms...');
      console.log('This finds existing posts and shows their current engagement metrics.');
      console.log('');

      const limit = parseInt(options.limit) || 10;
      const allPosts: any[] = [];

      // Get configured platforms
      const configuredPlatforms = hyperPost.getConfiguredPlatforms();

      for (const platformName of configuredPlatforms) {
        if (options.platform && options.platform !== platformName) {
          continue; // Skip if filtering by platform
        }

        try {
          const platform = hyperPost.getPlatform(platformName);
          if (!platform || !platform.discoverPosts) {
            console.log(`⚠️  ${platformName}: Post discovery not supported`);
            continue;
          }

          console.log(`📡 Checking ${platformName}...`);
          const posts = await platform.discoverPosts(limit);

          if (posts.length > 0) {
            console.log(`✅ Found ${posts.length} posts on ${platformName}`);
            allPosts.push(...posts.map(post => ({ ...post, platform: platformName })));
          } else {
            console.log(`📭 No posts found on ${platformName}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.log(`❌ ${platformName}: Failed to discover posts - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log('');
      console.log(`📊 Discovery Complete:`);
      console.log('=' .repeat(50));
      console.log(`Total Posts Found: ${allPosts.length}`);
      console.log('');

      if (allPosts.length > 0) {
        console.log('Posts with Analytics:');
        console.log('=' .repeat(50));

        allPosts.forEach((post, index) => {
          const date = post.createdAt.toLocaleString();
          const metrics = Object.entries(post.analytics)
            .filter(([key, value]) => typeof value === 'number' && value > 0)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') || 'No engagement yet';

          console.log(`${index + 1}. [${date}] ${post.platform.toUpperCase()}`);
          console.log(`   URL: ${post.url}`);
          console.log(`   Content: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`);
          console.log(`   Analytics: ${metrics}`);
          console.log('');
        });

        console.log('💡 Tip: Use "hyper-post import-post <url>" to add these posts to analytics tracking!');
      } else {
        console.log('No posts found on any platforms.');
        console.log('This could mean:');
        console.log('- No posts exist on the platforms');
        console.log('- Platform APIs are rate limited');
        console.log('- Authentication issues');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('import-post <url>')
  .description('Import an existing post by URL for analytics tracking')
  .action(async (url) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      console.log(`📥 Importing post: ${url}`);
      console.log('This will add the post to the database and start tracking its analytics.');
      console.log('');

      // Determine platform from URL
      let platformName = '';
      if (url.includes('mastodon.social')) {
        platformName = 'mastodon';
      } else if (url.includes('bsky.app')) {
        platformName = 'bluesky';
      } else if (url.includes('reddit.com')) {
        platformName = 'reddit';
      } else if (url.includes('discord.com')) {
        platformName = 'discord';
      }

      if (!platformName) {
        console.error('❌ Could not determine platform from URL');
        console.log('Supported platforms: Mastodon, Bluesky, Reddit, Discord');
        process.exit(1);
      }

      if (!hyperPost.isPlatformConfigured(platformName as any)) {
        console.error(`❌ ${platformName} is not configured in your credentials`);
        process.exit(1);
      }

      // Get platform instance
      const platform = hyperPost.getPlatform(platformName);
      if (!platform) {
        console.error(`❌ Could not get ${platformName} platform instance`);
        process.exit(1);
      }

      // Get post data and analytics
      console.log(`🔍 Gathering analytics for ${platformName} post...`);
      const analytics = await platform.gatherAnalytics(url);

      // Try to get post details from the platform's discoverPosts method
      // by fetching recent posts and finding the matching URL
      let postDetails: any = null;
      try {
        const recentPosts = await platform.discoverPosts(50); // Get more posts to find the right one
        postDetails = recentPosts.find(post => post.url === url);
      } catch (error) {
        console.warn('Could not fetch post details, using basic import');
      }

      if (!postDetails) {
        console.error('❌ Could not find post details. The post may not exist or the platform API is not accessible.');
        process.exit(1);
      }

      // Directly import the post to the database (bypass deduplication for imports)
      try {
        const { prisma } = await import('./database');

        // Get platform from database
        const dbPlatform = await prisma.platform.findUnique({
          where: { name: platformName }
        });

        if (!dbPlatform) {
          console.error(`❌ Platform ${platformName} not found in database`);
          process.exit(1);
        }

        // Create the post with actual content
        const contentHash = crypto.createHash('sha256').update(postDetails.content + url).digest('hex');

        const post = await prisma.post.upsert({
          where: { contentHash },
          update: {
            title: postDetails.content.split('\n')[0].substring(0, 200), // First line as title
            content: postDetails.content,
            url: url
          },
          create: {
            contentHash,
            title: postDetails.content.split('\n')[0].substring(0, 200),
            content: postDetails.content,
            url: url
          }
        });

        // Create the post-platform relationship
        await prisma.postPlatform.upsert({
          where: {
            postId_platformId: {
              postId: post.id,
              platformId: dbPlatform.id
            }
          },
          update: {
            postUrl: url
          },
          create: {
            postId: post.id,
            platformId: dbPlatform.id,
            postUrl: url,
            postedAt: postDetails.createdAt || new Date()
          }
        });

        console.log(`✅ Post imported to database successfully!`);
        console.log(`📊 Current analytics: ${Object.entries(analytics).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None yet'}`);
        console.log('');
        console.log('💡 Tip: Run "hyper-post gather-analytics" periodically to update analytics!');

      } catch (dbError) {
        console.error('❌ Failed to import post to database:', dbError);
        process.exit(1);
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('repost')
  .description('Repost existing content to additional platforms')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms to repost to')
  .option('--all', 'Repost all existing posts to specified platforms (requires --batch)')
  .option('--batch', 'Enable batch mode with 5-minute delays between posts')
  .option('--hash <hash>', 'Repost specific post by content hash')
  .option('--dry-run', 'Preview reposts without actually posting')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      if (!options.platforms) {
        console.error('❌ Please specify platforms with -p or --platforms');
        console.error('Examples:');
        console.error('  hyper-post repost --platforms devto --hash <hash>     # Single post');
        console.error('  hyper-post repost --platforms devto --batch --all    # Batch mode');
        process.exit(1);
      }

      const targetPlatforms = options.platforms.split(',').map((p: string) => p.trim());

      // Validate platforms
      const configuredPlatforms = hyperPost.getConfiguredPlatforms();
      const invalidPlatforms = targetPlatforms.filter((p: string) => !configuredPlatforms.includes(p));
      if (invalidPlatforms.length > 0) {
        console.error(`❌ Invalid platforms: ${invalidPlatforms.join(', ')}`);
        console.error(`Configured platforms: ${configuredPlatforms.join(', ')}`);
        process.exit(1);
      }

      let postsToRepost: any[] = [];

      if (options.all) {
        if (!options.batch) {
          console.error('❌ --all requires --batch flag for safety');
          console.error('Use --batch to enable posting multiple posts with delays');
          console.error('Or use --hash to repost a specific post');
          process.exit(1);
        }

        // Get all posts from database
        const allPosts = await prisma.post.findMany({
          include: {
            postPlatforms: {
              include: {
                platform: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Filter out posts that have already been posted to target platforms
        postsToRepost = allPosts.filter((post: any) => {
          const postedPlatforms = post.postPlatforms.map((pp: any) => pp.platform.name);
          return !targetPlatforms.every((platform: string) => postedPlatforms.includes(platform));
        });

      } else if (options.hash) {
        // Find specific post by hash
        const post = await prisma.post.findUnique({
          where: { contentHash: options.hash },
          include: {
            postPlatforms: {
              include: {
                platform: true
              }
            }
          }
        });

        if (!post) {
          console.error(`❌ Post with hash ${options.hash} not found`);
          process.exit(1);
        }

        const postedPlatforms = post.postPlatforms.map((pp: any) => pp.platform.name);
        const needsRepost = !targetPlatforms.every((platform: string) => postedPlatforms.includes(platform));

        if (!needsRepost) {
          console.log(`ℹ️ Post ${options.hash} has already been posted to all target platforms`);
          return;
        }

        postsToRepost = [post];
      } else {
        console.error('❌ Please specify --all (with --batch) or --hash <hash>');
        console.error('Examples:');
        console.error('  hyper-post repost --platforms devto --batch --all  # Batch mode with delays');
        console.error('  hyper-post repost --platforms devto --hash abc123...  # Single post');
        process.exit(1);
      }

      if (postsToRepost.length === 0) {
        console.log('ℹ️ No posts need reposting to the specified platforms');
        return;
      }

      console.log(`🔄 Found ${postsToRepost.length} post(s) to repost to: ${targetPlatforms.join(', ')}`);
      if (options.batch && postsToRepost.length > 1) {
        console.log(`⏰ Batch mode: 5-minute delays between posts`);
      }
      console.log('');

      for (let i = 0; i < postsToRepost.length; i++) {
        const post = postsToRepost[i];

        // Show progress in batch mode
        if (options.batch && postsToRepost.length > 1) {
          console.log(`📦 Batch Progress: ${i + 1}/${postsToRepost.length}`);
        }

        console.log(`📝 Reposting: ${post.title || post.content.substring(0, 50)}${post.title ? '' : '...'}`);
        console.log(`   Hash: ${post.contentHash}`);
        console.log(`   Created: ${post.createdAt.toLocaleString()}`);

        const socialPost: SocialPost = {
          content: post.content,
          title: post.title,
          url: post.url
        };

        if (options.dryRun) {
          console.log(`   🔍 Would post to: ${targetPlatforms.join(', ')}`);
        } else {
          try {
            const result = await hyperPost.postToPlatforms(targetPlatforms, socialPost);
            console.log(`   ✅ Results: ${result.successful} successful, ${result.failed} failed`);
            result.results.forEach(r => {
              if (r.success) {
                console.log(`     ✅ ${r.platform}: ${r.url || 'Posted successfully'}`);
              } else {
                console.log(`     ❌ ${r.platform}: ${r.error}`);
              }
            });
          } catch (error) {
            console.log(`   ❌ Failed to repost: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        console.log('');

        // Add 5-minute delay between posts in batch mode (except for the last post)
        if (options.batch && i < postsToRepost.length - 1) {
          console.log(`⏳ Waiting 5 minutes before next post...`);
          await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
          console.log(`🚀 Continuing with next post...\n`);
        }
      }

      if (options.dryRun) {
        console.log('💡 Remove --dry-run to actually repost');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();

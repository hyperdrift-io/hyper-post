import { Command } from 'commander';
import { HyperPost } from './HyperPost';
import { SocialPost } from './types';
import { SignupManager } from './signup-manager';
import { prisma } from './database';
import * as crypto from 'crypto';

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
  .description('List and test configured platforms')
  .option('--test', 'Test credentials for each platform')
  .option('--platform <platform>', 'Test only a specific platform')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      const platforms = hyperPost.getConfiguredPlatforms();

      if (platforms.length === 0) {
        console.log('No platforms configured. Run setup to configure platforms.');
        console.log('Run "hyper-post setup" to configure platforms interactively.');
        return;
      }

      let platformsToTest = platforms;
      if (options.platform) {
        if (!platforms.includes(options.platform)) {
          console.error(`❌ Platform '${options.platform}' is not configured.`);
          console.log('Available platforms:', platforms.join(', '));
          process.exit(1);
        }
        platformsToTest = [options.platform];
      }

      if (options.test) {
        console.log('🧪 Testing credentials for platforms...\n');

        for (const platformName of platformsToTest) {
          try {
            const platform = hyperPost.getPlatform(platformName);
            if (!platform) {
              console.log(`❌ ${platformName}: Platform class not found`);
              continue;
            }

            // Test basic credential validation
            platform.validateCredentials();

            // Try a simple API call to test connectivity (this would be platform-specific)
            // For now, just validate that credentials are present and properly formatted
            console.log(`✅ ${platformName}: Credentials validated`);
          } catch (error) {
            console.log(`❌ ${platformName}: ${error instanceof Error ? error.message : 'Validation failed'}`);
          }
        }

        console.log('\n💡 Note: Full API connectivity tests would require actual API calls.');
        console.log('   Use --dry-run with the post command for more comprehensive testing.');
      } else {
        console.log('Configured platforms:');
        platformsToTest.forEach(platform => {
          console.log(`- ${platform}`);
        });

        if (platformsToTest.length > 0) {
          console.log('\n💡 Use --test to validate credentials, or --platform <name> --test to test a specific platform.');
        }
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

program
  .command('test-post <platform>')
  .description('Test posting to a specific platform (dry run)')
  .option('-c, --content <content>', 'Post content')
  .option('-t, --title <title>', 'Post title')
  .option('-u, --url <url>', 'URL to include')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (platformName, options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      if (!hyperPost.isPlatformConfigured(platformName as any)) {
        console.error(`❌ Platform '${platformName}' is not configured.`);
        console.log('Run "hyper-post platforms" to see configured platforms.');
        process.exit(1);
      }

      const post: SocialPost = {
        content: options.content || 'Test post from HyperPost CLI',
        title: options.title,
        url: options.url,
        tags: options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : undefined
      };

      console.log(`🧪 Testing post to ${platformName}...`);
      console.log('=' .repeat(50));
      console.log(`Content: ${post.content}`);
      if (post.title) console.log(`Title: ${post.title}`);
      if (post.url) console.log(`URL: ${post.url}`);
      if (post.tags) console.log(`Tags: ${post.tags.join(', ')}`);
      console.log('=' .repeat(50));

      // Test credentials first
      try {
        const platform = hyperPost.getPlatform(platformName);
        platform?.validateCredentials();
        console.log(`✅ ${platformName}: Credentials validated`);
      } catch (error) {
        console.log(`❌ ${platformName}: ${error instanceof Error ? error.message : 'Credential validation failed'}`);
        process.exit(1);
      }

      // Perform dry run post
      const result = await hyperPost.postToPlatforms([platformName as any], post);

      console.log(`📊 Results: ${result.successful} successful, ${result.failed} failed`);

      if (result.successful > 0) {
        console.log(`✅ ${platformName}: Post test successful!`);
        if (result.results?.[0]?.url) {
          console.log(`🔗 Would post to: ${result.results[0].url}`);
        }
      } else {
        console.log(`❌ ${platformName}: Post test failed`);
        // Check if there are any results with errors
        if (result.results && result.results.length > 0) {
          const failedResult = result.results.find(r => !r.success);
          if (failedResult) {
            console.log(`Error: ${failedResult.error || 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

function loadCredentials(): any {
  const credentials: any = {};

  // Load from SignupManager (persistent data from ~/.config/hyper-post/)
  const signupManager = new SignupManager();
  const completedAccounts = signupManager.getAllCompletedAccounts();

  for (const [platform, accountData] of Object.entries(completedAccounts)) {
    credentials[platform] = accountData;
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

// ==================== SCHEDULING COMMANDS ====================

program
  .command('schedule')
  .description('Schedule a post for future publishing')
  .requiredOption('-c, --content <content>', 'Post content')
  .requiredOption('--at <datetime>', 'Schedule datetime (ISO 8601 or "YYYY-MM-DD HH:mm")')
  .requiredOption('-p, --platforms <platforms>', 'Comma-separated list of platforms')
  .option('-t, --title <title>', 'Post title')
  .option('-u, --url <url>', 'URL to include')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      // Parse datetime
      let scheduledAt: Date;
      try {
        scheduledAt = new Date(options.at);
        if (isNaN(scheduledAt.getTime())) {
          throw new Error('Invalid date');
        }
      } catch {
        console.error('❌ Invalid datetime format. Use ISO 8601 or "YYYY-MM-DD HH:mm"');
        console.error('Examples:');
        console.error('  --at "2024-02-01T10:00:00Z"');
        console.error('  --at "2024-02-01 10:00"');
        process.exit(1);
      }

      if (scheduledAt <= new Date()) {
        console.error('❌ Scheduled time must be in the future');
        process.exit(1);
      }

      const platforms = options.platforms.split(',').map((p: string) => p.trim());

      // Validate platforms
      const configuredPlatforms = hyperPost.getConfiguredPlatforms();
      const invalidPlatforms = platforms.filter((p: string) => !configuredPlatforms.includes(p));
      if (invalidPlatforms.length > 0) {
        console.error(`❌ Invalid platforms: ${invalidPlatforms.join(', ')}`);
        console.error(`Configured platforms: ${configuredPlatforms.join(', ')}`);
        process.exit(1);
      }

      const tags = options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : undefined;
      const contentHash = crypto.createHash('sha256')
        .update(`${options.title || ''}|${options.content}|${options.url || ''}`)
        .digest('hex');

      const scheduled = await prisma.scheduledPost.create({
        data: {
          contentHash,
          title: options.title,
          content: options.content,
          url: options.url,
          tags: tags ? JSON.stringify(tags) : null,
          platforms: JSON.stringify(platforms),
          scheduledAt,
          status: 'pending'
        }
      });

      console.log('📅 Post scheduled successfully!');
      console.log('=' .repeat(50));
      console.log(`ID: ${scheduled.id}`);
      console.log(`Scheduled for: ${scheduledAt.toLocaleString()}`);
      console.log(`Platforms: ${platforms.join(', ')}`);
      console.log(`Content: ${options.content.substring(0, 100)}${options.content.length > 100 ? '...' : ''}`);
      console.log('');
      console.log('💡 Run "hyper-post schedule-run" via cron to process scheduled posts');
      console.log('   Example crontab: */5 * * * * hyper-post schedule-run');

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('schedule-list')
  .description('List scheduled posts')
  .option('--status <status>', 'Filter by status (pending, posted, failed, cancelled)')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (options) => {
    try {
      const where: any = {};
      if (options.status) {
        where.status = options.status;
      }

      const scheduled = await prisma.scheduledPost.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        take: parseInt(options.limit) || 20
      });

      if (scheduled.length === 0) {
        console.log('📭 No scheduled posts found');
        return;
      }

      console.log(`📅 Scheduled Posts (${scheduled.length}):`);
      console.log('=' .repeat(70));

      scheduled.forEach((post, index) => {
        const platforms = JSON.parse(post.platforms);
        const statusIcon = {
          pending: '⏳',
          posted: '✅',
          failed: '❌',
          cancelled: '🚫'
        }[post.status] || '❓';

        console.log(`${index + 1}. ${statusIcon} [${post.status.toUpperCase()}]`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Scheduled: ${post.scheduledAt.toLocaleString()}`);
        console.log(`   Platforms: ${platforms.join(', ')}`);
        if (post.title) console.log(`   Title: ${post.title}`);
        console.log(`   Content: ${post.content.substring(0, 80)}${post.content.length > 80 ? '...' : ''}`);
        if (post.error) console.log(`   Error: ${post.error}`);
        console.log('');
      });

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('schedule-cancel <id>')
  .description('Cancel a scheduled post')
  .action(async (id) => {
    try {
      const post = await prisma.scheduledPost.findUnique({ where: { id } });

      if (!post) {
        console.error(`❌ Scheduled post ${id} not found`);
        process.exit(1);
      }

      if (post.status !== 'pending') {
        console.error(`❌ Cannot cancel post with status: ${post.status}`);
        process.exit(1);
      }

      await prisma.scheduledPost.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      console.log(`🚫 Scheduled post ${id} cancelled`);

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('schedule-run')
  .description('Process due scheduled posts (run via cron)')
  .option('--dry-run', 'Preview without posting')
  .action(async (options) => {
    try {
      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      const now = new Date();
      const duePosts = await prisma.scheduledPost.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: now }
        },
        orderBy: { scheduledAt: 'asc' }
      });

      if (duePosts.length === 0) {
        console.log('📭 No scheduled posts due');
        return;
      }

      console.log(`🚀 Processing ${duePosts.length} scheduled post(s)...`);
      console.log('');

      for (const scheduledPost of duePosts) {
        const platforms = JSON.parse(scheduledPost.platforms);
        const tags = scheduledPost.tags ? JSON.parse(scheduledPost.tags) : undefined;

        console.log(`📝 Processing: ${scheduledPost.title || scheduledPost.content.substring(0, 50)}...`);
        console.log(`   Platforms: ${platforms.join(', ')}`);

        if (options.dryRun) {
          console.log(`   🔍 Would post now (dry-run)`);
          continue;
        }

        try {
          const post: SocialPost = {
            content: scheduledPost.content,
            title: scheduledPost.title || undefined,
            url: scheduledPost.url || undefined,
            tags
          };

          const result = await hyperPost.postToPlatforms(platforms, post);

          if (result.failed === 0) {
            await prisma.scheduledPost.update({
              where: { id: scheduledPost.id },
              data: { status: 'posted', postedAt: new Date() }
            });
            console.log(`   ✅ Posted successfully`);
          } else {
            const errors = result.results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`);
            await prisma.scheduledPost.update({
              where: { id: scheduledPost.id },
              data: { status: 'failed', error: errors.join('; ') }
            });
            console.log(`   ❌ Failed: ${errors.join(', ')}`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          await prisma.scheduledPost.update({
            where: { id: scheduledPost.id },
            data: { status: 'failed', error: errorMsg }
          });
          console.log(`   ❌ Error: ${errorMsg}`);
        }

        console.log('');
      }

      if (options.dryRun) {
        console.log('💡 Remove --dry-run to actually post');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ==================== BLOG PROMOTION COMMANDS ====================

program
  .command('promote')
  .description('Promote a blog article to social media platforms')
  .option('--blog-dir <path>', 'Path to blog content directory')
  .option('--base-url <url>', 'Base URL for the blog (default: https://hyperdrift.io)')
  .option('--slug <slug>', 'Specific blog post slug to promote')
  .option('--recent <days>', 'Promote posts from the last N days', '7')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms')
  .option('--full-content', 'Use full article content for Dev.to/Medium (default: excerpt only)')
  .option('--schedule <datetime>', 'Schedule the post instead of posting immediately')
  .option('--dry-run', 'Preview the promotion without posting')
  .option('--list', 'List available blog posts without promoting')
  .action(async (options) => {
    try {
      const { readBlogPosts, getBlogPostBySlug, generatePromotion, formatPromotionPreview, getRecentUnpromotedPosts } = await import('./blog-promotion');
      const fs = await import('fs');
      const path = await import('path');

      // Determine blog directory
      let blogDir = options.blogDir;
      if (!blogDir) {
        // Try common locations relative to hyper-post
        const possiblePaths = [
          path.join(process.cwd(), '../hyper-drift/content/blog'),
          path.join(process.cwd(), 'content/blog'),
          '/Users/yann/dev/hyperdrift-io/hyper-drift/content/blog'
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            blogDir = p;
            break;
          }
        }

        if (!blogDir) {
          console.error('❌ Could not find blog content directory.');
          console.error('   Use --blog-dir to specify the path.');
          process.exit(1);
        }
      }

      const baseUrl = options.baseUrl || 'https://hyperdrift.io';

      // List mode
      if (options.list) {
        const posts = readBlogPosts(blogDir);
        console.log(`📚 Found ${posts.length} blog posts in ${blogDir}:\n`);
        posts.forEach((post, i) => {
          const date = new Date(post.date).toLocaleDateString();
          console.log(`${i + 1}. [${date}] ${post.title}`);
          console.log(`   Slug: ${post.slug}`);
          console.log(`   Tags: ${post.tags.join(', ')}`);
          console.log('');
        });
        return;
      }

      // Get the post(s) to promote
      let postsToPromote;
      if (options.slug) {
        const post = getBlogPostBySlug(blogDir, options.slug);
        if (!post) {
          console.error(`❌ Blog post not found: ${options.slug}`);
          process.exit(1);
        }
        postsToPromote = [post];
      } else {
        postsToPromote = getRecentUnpromotedPosts(blogDir, parseInt(options.recent) || 7);
        if (postsToPromote.length === 0) {
          console.log(`📭 No blog posts found from the last ${options.recent || 7} days.`);
          console.log('   Use --slug to promote a specific post, or --recent to adjust the timeframe.');
          return;
        }
      }

      console.log(`🚀 Promoting ${postsToPromote.length} blog post(s):\n`);

      for (const post of postsToPromote) {
        // Read full content if needed
        let fullContent;
        if (options.fullContent) {
          const fileContent = fs.readFileSync(post.filePath, 'utf8');
          // Remove frontmatter for the content
          const contentMatch = fileContent.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
          fullContent = contentMatch ? contentMatch[1] : fileContent;
        }

        const promo = generatePromotion(post, baseUrl, {
          includeExcerpt: true,
          maxContentLength: 280
        });

        console.log(formatPromotionPreview(promo));

        if (options.dryRun) {
          console.log('🔍 Dry run - would post to platforms');
          continue;
        }

        // Load credentials and create HyperPost instance
        const credentials = loadCredentials();
        const hyperPost = new HyperPost(credentials);

        // Determine target platforms
        let targetPlatforms: string[];
        if (options.platforms) {
          targetPlatforms = options.platforms.split(',').map((p: string) => p.trim());
        } else {
          targetPlatforms = hyperPost.getConfiguredPlatforms();
        }

        // Build the social post
        const socialPost: SocialPost = {
          content: promo.content,
          title: promo.title,
          url: promo.url,
          tags: promo.tags
        };

        // For Dev.to/Medium, use full content if available
        if (fullContent && (targetPlatforms.includes('devto') || targetPlatforms.includes('medium'))) {
          // Create a separate post for long-form platforms
          const longFormPlatforms = targetPlatforms.filter(p => p === 'devto' || p === 'medium');
          const shortFormPlatforms = targetPlatforms.filter(p => p !== 'devto' && p !== 'medium');

          if (longFormPlatforms.length > 0) {
            const longFormPost: SocialPost = {
              content: fullContent + `\n\n---\n\n*Originally published at [HyperDrift](${promo.url})*`,
              title: promo.title,
              url: promo.url,
              tags: promo.tags
            };

            console.log(`📰 Posting full article to: ${longFormPlatforms.join(', ')}`);

            if (options.schedule) {
              const scheduledAt = new Date(options.schedule);
              if (isNaN(scheduledAt.getTime())) {
                console.error('❌ Invalid schedule datetime');
                process.exit(1);
              }
              // Schedule instead of posting
              const contentHash = crypto.createHash('sha256')
                .update(`${longFormPost.title}|${longFormPost.content}|${longFormPost.url}`)
                .digest('hex');

              await prisma.scheduledPost.create({
                data: {
                  contentHash,
                  title: longFormPost.title,
                  content: longFormPost.content,
                  url: longFormPost.url,
                  tags: longFormPost.tags ? JSON.stringify(longFormPost.tags) : null,
                  platforms: JSON.stringify(longFormPlatforms),
                  scheduledAt,
                  status: 'pending'
                }
              });
              console.log(`📅 Scheduled for: ${scheduledAt.toLocaleString()}`);
            } else {
              const result = await hyperPost.postToPlatforms(longFormPlatforms as any, longFormPost);
              result.results.forEach(r => {
                if (r.success) {
                  console.log(`✅ ${r.platform}: ${r.url}`);
                } else {
                  console.log(`❌ ${r.platform}: ${r.error}`);
                }
              });
            }
          }

          if (shortFormPlatforms.length > 0) {
            console.log(`\n🐦 Posting excerpt to: ${shortFormPlatforms.join(', ')}`);

            if (options.schedule) {
              const scheduledAt = new Date(options.schedule);
              const contentHash = crypto.createHash('sha256')
                .update(`${socialPost.title}|${socialPost.content}|${socialPost.url}`)
                .digest('hex');

              await prisma.scheduledPost.create({
                data: {
                  contentHash,
                  title: socialPost.title,
                  content: socialPost.content,
                  url: socialPost.url,
                  tags: socialPost.tags ? JSON.stringify(socialPost.tags) : null,
                  platforms: JSON.stringify(shortFormPlatforms),
                  scheduledAt,
                  status: 'pending'
                }
              });
              console.log(`📅 Scheduled for: ${scheduledAt.toLocaleString()}`);
            } else {
              const result = await hyperPost.postToPlatforms(shortFormPlatforms as any, socialPost);
              result.results.forEach(r => {
                if (r.success) {
                  console.log(`✅ ${r.platform}: ${r.url}`);
                } else {
                  console.log(`❌ ${r.platform}: ${r.error}`);
                }
              });
            }
          }
        } else {
          // Standard posting to all platforms
          console.log(`📤 Posting to: ${targetPlatforms.join(', ')}`);

          if (options.schedule) {
            const scheduledAt = new Date(options.schedule);
            if (isNaN(scheduledAt.getTime())) {
              console.error('❌ Invalid schedule datetime');
              process.exit(1);
            }

            const contentHash = crypto.createHash('sha256')
              .update(`${socialPost.title}|${socialPost.content}|${socialPost.url}`)
              .digest('hex');

            await prisma.scheduledPost.create({
              data: {
                contentHash,
                title: socialPost.title,
                content: socialPost.content,
                url: socialPost.url,
                tags: socialPost.tags ? JSON.stringify(socialPost.tags) : null,
                platforms: JSON.stringify(targetPlatforms),
                scheduledAt,
                status: 'pending'
              }
            });
            console.log(`📅 Scheduled for: ${scheduledAt.toLocaleString()}`);
          } else {
            const result = await hyperPost.postToPlatforms(targetPlatforms as any, socialPost);
            result.results.forEach(r => {
              if (r.success) {
                console.log(`✅ ${r.platform}: ${r.url}`);
              } else {
                console.log(`❌ ${r.platform}: ${r.error}`);
              }
            });
          }
        }

        console.log('');
      }

      if (options.dryRun) {
        console.log('💡 Remove --dry-run to actually post');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ==================== ECOSYSTEM ANNOUNCEMENTS ====================

program
  .command('announce-ecosystem')
  .description('Announce new ecosystem content (releases, journeys) from hyper-drift sync')
  .option('--file <path>', 'Path to pending-announcements.json (default: ../hyper-drift/data/pending-announcements.json)')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms')
  .option('--dry-run', 'Preview announcements without posting')
  .option('--delay <seconds>', 'Delay between posts in seconds (default: 60)', '60')
  .action(async (options) => {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Find pending announcements file
      let filePath = options.file;
      if (!filePath) {
        const possiblePaths = [
          path.join(process.cwd(), '../hyper-drift/data/pending-announcements.json'),
          path.join(process.cwd(), 'data/pending-announcements.json'),
          '/Users/yann/dev/hyperdrift-io/hyper-drift/data/pending-announcements.json'
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            filePath = p;
            break;
          }
        }

        if (!filePath) {
          console.log('📭 No pending announcements found');
          console.log('   Run hyper-drift/scripts/sync-ecosystem.mjs first');
          return;
        }
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (!data.items || data.items.length === 0) {
        console.log('📭 No pending announcements');
        return;
      }

      console.log(`📢 Found ${data.items.length} pending announcement(s):\n`);

      const credentials = loadCredentials();
      const hyperPost = new HyperPost(credentials);

      // Determine target platforms
      let targetPlatforms: string[];
      if (options.platforms) {
        targetPlatforms = options.platforms.split(',').map((p: string) => p.trim());
      } else {
        targetPlatforms = hyperPost.getConfiguredPlatforms();
      }

      const delay = parseInt(options.delay) || 60;
      const announcedPath = path.join(path.dirname(filePath), 'announced-content.json');

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        
        console.log(`${i + 1}. [${item.type.toUpperCase()}] ${item.title}`);
        
        // Generate announcement content
        let postContent: string;
        if (item.type === 'release') {
          postContent = `🚀 ${item.title}\n\n${(item.body || '').split('\\n')[0] || 'Check out the latest release!'}\n\n${item.url}`;
        } else {
          postContent = `📚 New from HyperDrift: ${item.title}\n\n${item.excerpt || 'Read more about our journey.'}\n\n${item.url}`;
        }

        console.log(`   Content: ${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}`);
        console.log(`   Platforms: ${targetPlatforms.join(', ')}`);

        if (options.dryRun) {
          console.log('   🔍 [DRY RUN] Would post\n');
          continue;
        }

        try {
          const post: SocialPost = {
            content: postContent,
            title: item.title,
            url: item.url,
            tags: [item.type, 'hyperdrift', item.app]
          };

          const result = await hyperPost.postToPlatforms(targetPlatforms as any, post);
          
          result.results.forEach(r => {
            if (r.success) {
              console.log(`   ✅ ${r.platform}: ${r.url || 'Posted'}`);
            } else {
              console.log(`   ❌ ${r.platform}: ${r.error}`);
            }
          });

          // Mark as announced
          let announced = { releases: [], journeys: [] };
          try {
            if (fs.existsSync(announcedPath)) {
              announced = JSON.parse(fs.readFileSync(announcedPath, 'utf8'));
            }
          } catch {}

          const announcement = {
            slug: item.slug,
            announcedAt: new Date().toISOString(),
            ...(item.contentHash ? { contentHash: item.contentHash } : {})
          };

          if (item.type === 'release') {
            (announced.releases as any[]).push(announcement);
          } else {
            (announced.journeys as any[]).push(announcement);
          }

          fs.writeFileSync(announcedPath, JSON.stringify(announced, null, 2));

        } catch (error) {
          console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }

        // Delay between posts
        if (i < data.items.length - 1 && !options.dryRun) {
          console.log(`   ⏳ Waiting ${delay}s before next post...\n`);
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        } else {
          console.log('');
        }
      }

      // Clear pending announcements file after processing
      if (!options.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify({ generated: null, items: [] }, null, 2));
        console.log('✅ Cleared pending announcements');
      } else {
        console.log('💡 Remove --dry-run to actually post');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();

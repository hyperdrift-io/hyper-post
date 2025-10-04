# HyperPost

> ✦ A unified social media posting tool for underground platforms — publish to multiple social networks in one go.

---

## Overview

HyperPost is a command-line tool that lets you publish content to multiple social media platforms simultaneously. Built for the forgotten edge — fast, minimal, and resilient. Perfect for developers, content creators, and organizations who want to amplify their reach across alternative social networks.

Part of the **HyperDrift** ecosystem: open-source tools for raw potential and independent exploration.

---

## Features

- 🚀 **Multi-platform posting** - Post to multiple social networks in one command
- 🔒 **Secure credential management** - Environment-based configuration
- 📝 **Rich content support** - Titles, URLs, tags, and formatted text
- 🛠️ **CLI-first design** - Perfect for automation and scripting
- 🎯 **Underground focus** - Support for alternative social platforms
- 📊 **Detailed reporting** - Clear success/failure feedback for each platform

### Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Mastodon | ✅ Ready | Federated social network |
| Bluesky | ✅ Ready | Decentralized social network |
| Discord | ✅ Ready | Community servers |
| Reddit | ✅ Ready | Community discussions |
| HackerNews | 🔄 Planned | Tech community |
| Dev.to | 🔄 Planned | Developer community |
| Medium | 🔄 Planned | Publishing platform |
| Tumblr | 🔄 Planned | Creative community |
| Pinterest | 🔄 Planned | Visual discovery |

---

## Installation

### Local Development (Recommended for Contributors)

Use pnpm to link the package locally for development:

```bash
# Navigate to the hyper-post directory
cd /path/to/hyper-post

# Link the package globally
pnpm link

# In your target project directory
pnpm link hyper-post
```

### As a global CLI tool

```bash
# Install globally
pnpm add -g hyper-post

# Or with npm
npm install -g hyper-post

# Or with yarn
yarn global add hyper-post
```

### As a project dependency

```bash
# Add to your project
pnpm add hyper-post

# Or with npm
npm install hyper-post

# Or with yarn
yarn add hyper-post
```

### Local Path Installation

Install directly from a local directory:

```bash
# Install from local path
pnpm add file:/path/to/hyper-post

# Or with npm
npm install /path/to/hyper-post

# Or with yarn
yarn add file:/path/to/hyper-post
```

---

## Quick Start

### Setup (Required - Do This First!)
Use the guided account creation wizard that helps you create genuine social media accounts with complete profiles:

```bash
# (Optional) For global installs, customize default template values in ~/.config/hyper-post/config.json
# The wizard will use these as prefilled defaults

# Run the comprehensive setup wizard
hyper-post setup

# This will:
# 1. Set up your database (SQLite recommended, PostgreSQL optional)
# 2. Create consistent branding templates (saved persistently)
# 3. Guide you through account creation on each platform
# 4. Help you set up complete profiles (bio, website, images, etc.)
# 5. Generate API credentials automatically
# 6. Save everything securely in your config directory

# Templates persist across sessions - reuse branding on new platforms!
# Run setup again to add more platforms using existing templates

# Then post to all configured platforms
hyper-post post -c "Hello from HyperPost! 🚀" -t "My First Post" -u "https://hyperdrift.io"

# Check posting history and analytics
hyper-post history
hyper-post history --platform mastodon
hyper-post analytics
hyper-post analytics --platform bluesky --days 7
hyper-post history --clear  # Clear history if needed
```

## ✨ Features

### 🛡️ **Duplicate Prevention**
HyperPost automatically prevents duplicate posts to the same platform within a 24-hour window:

- **Content-based hashing**: SHA-256 hash of title + content + URL
- **Platform-specific tracking**: Different platforms can receive the same content
- **Time-windowed**: Old posts (24+ hours) are automatically cleaned up
- **History management**: View, filter, and clear posting history

```bash
# View all posting history
hyper-post history

# Filter by platform
hyper-post history --platform mastodon

# Clear history (allows reposting)
hyper-post history --clear
```

### 🗄️ **Database Support**
HyperPost supports both SQLite (recommended) and PostgreSQL:

**SQLite (Default - No Setup Required):**
- File-based database (`hyperpost.db`)
- Zero configuration
- Perfect for individual users
- Automatically set up by the setup wizard

**PostgreSQL (Advanced):**
- Robust multi-user support
- Better for teams/organizations
- Requires PostgreSQL server
- Configurable during setup

```bash
# Database commands (run after setup)
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Create/update database schema
pnpm db:studio      # View database in browser
pnpm db:migrate     # Create migrations (production)
```

### ⚙️ **Persistent Configuration**
- **Prisma ORM**: Type-safe database operations
- **Post tracking**: Full history with platform-specific URLs
- **Deduplication**: SHA-256 content hashing with time windows
- **Analytics**: Platform usage stats and posting patterns
- **Signup templates**: Reusable account creation templates

### 📊 **Analytics & Insights**
```bash
# View comprehensive analytics
hyper-post analytics

# Platform-specific analytics
hyper-post analytics --platform mastodon

# Recent activity (last 7 days)
hyper-post analytics --days 7

# Full posting history with URLs
hyper-post history --limit 100
```

### Advanced: Environment Variable Configuration

For CI/CD, Docker, or custom setups, you can override stored credentials with environment variables:

```bash
# Mastodon
export MASTODON_INSTANCE=your-instance.social
export MASTODON_ACCESS_TOKEN=your_access_token

# Bluesky
export BLUESKY_IDENTIFIER=your-handle.bsky.social
export BLUESKY_PASSWORD=your_app_password

# Discord
export DISCORD_TOKEN=your_bot_token
export DISCORD_CHANNEL_ID=your_channel_id

# Then run commands
hyper-post post -c "Hello from HyperPost! 🚀"
```

**Note**: Environment variables override any stored credentials from the setup wizard.

---

## 🎯 Why HyperPost?

HyperPost stands out from other social media automation tools:

### ✨ **Genuine Account Creation**
- **Complete profiles** with bios, websites, locations, and images
- **Consistent branding** across all platforms
- **Professional appearance** that builds trust and credibility
- **Guided setup** ensures no steps are missed

### 🔧 **Developer-Friendly**
- **Modular architecture** - easily add new platforms
- **TypeScript** with full type safety
- **Comprehensive error handling** and logging
- **Environment-based configuration** for security

### 🚀 **Production-Ready**
- **Generic and publishable** - can be used by anyone
- **Multi-platform support** - post to all networks simultaneously
- **Rich content support** - titles, URLs, hashtags, formatting
- **Rate limiting awareness** and automatic retries

### 💾 **Persistent Data Management**
- **Signup templates saved** in config directory (`~/.config/hyper-post/` for global installs)
- **Reuse branding** across multiple platforms
- **Completed accounts tracked** persistently
- **Automatic .env generation** from stored data
- **Session continuity** - templates persist across runs

---

## Configuration

### Config File Locations

HyperPost intelligently stores configuration based on your installation type:

#### Global CLI Installation (recommended)
When installed globally (`pnpm add -g hyper-post`), configuration is stored in:
- **`~/.config/hyper-post/signup-data.json`** - Your account credentials and signup templates
- **`~/.config/hyper-post/config.json`** - Default template settings

#### Project-Specific Installation
When installed locally (`pnpm add hyper-post`), configuration is stored in your project directory:
- **`.hyperpost-signup.json`** - Your account credentials and signup templates
- **`.hyperpost-config.json`** - Default template settings

#### Configuration Priority
1. **Environment Variables** (highest priority - for CI/CD, Docker, or temporary overrides)
2. **Signup Manager** (persistent account data stored in config directory)

**No .env files needed!** All configuration is handled automatically by the setup wizard.

### Setup Process

**No manual configuration needed!** Use the interactive setup wizard:

```bash
# Run the setup wizard - it handles everything automatically
hyper-post setup
```

The setup wizard will:
- Guide you through account creation on each platform
- Generate API credentials automatically
- Store everything securely in your config directory
- Create consistent branding templates across platforms

### Getting Platform Credentials

#### Mastodon
1. Go to your Mastodon instance → Preferences → Development
2. Create a new application
3. Copy the access token
4. Set `MASTODON_INSTANCE` to your instance domain (e.g., `mastodon.social`)

#### Bluesky
1. Go to [bsky.app](https://bsky.app) → Settings → Privacy and security → App passwords
2. Create a new app password
3. Use your full handle (with .bsky.social) as identifier

#### Reddit
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. **Type**: `script`
4. **Name**: `HyperPost`
5. **Description**: `Multi-platform social media posting`
6. **About URL**: Leave blank
7. **Redirect URI**: `http://localhost:8080`
8. Click "Create app"
9. Copy the **client_id** (under the app name)
10. Copy the **secret** (labeled "secret")

#### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application → Bot
3. Copy the bot token
4. Get your channel ID by enabling Developer Mode in Discord and right-clicking the channel

---

## Usage

### CLI Commands

```bash
# Show help
hyper-post --help

# Post to all platforms
hyper-post post -c "Your content here"

# Post with title and URL
hyper-post post -c "Article content" -t "Article Title" -u "https://example.com"

# Post with tags
hyper-post post -c "Content" --tags "tech,opensource,web3"

# List configured platforms
hyper-post platforms

# Post to specific platforms only
hyper-post post -c "Content" -p "mastodon,bluesky,reddit"
```

### Programmatic Usage

```typescript
import { HyperPost, SocialPost } from 'hyper-post';

// Load credentials from environment
const credentials = {
  mastodon: {
    instance: process.env.MASTODON_INSTANCE!,
    accessToken: process.env.MASTODON_ACCESS_TOKEN!
  },
  bluesky: {
    identifier: process.env.BLUESKY_IDENTIFIER!,
    password: process.env.BLUESKY_PASSWORD!
  }
};

const hyperPost = new HyperPost(credentials);

const post: SocialPost = {
  content: "Hello from HyperPost!",
  title: "My First Post",
  url: "https://hyperdrift.io",
  tags: ["tech", "opensource"]
};

// Post to all platforms
const result = await hyperPost.postToAll(post);
console.log(`Posted successfully to ${result.successful} platforms`);

// Post to specific platforms
const specificResult = await hyperPost.postToPlatforms(['mastodon'], post);
```

---

## Project Status

MVP / Actively maintained / Beta

---

## Contributing

Contributions are welcome. Feel free to open an issue, suggest improvements, or submit a pull request. Together we sharpen the edge.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/hyperdrift-io/hyper-post.git
cd hyper-post

# Install dependencies (always use pnpm)
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Link for local development
pnpm link
```

---

## API Reference

### Classes

#### `HyperPost`

Main class for managing multi-platform posting.

**Methods:**
- `postToAll(content: SocialPost): Promise<MultiPlatformResult>`
- `postToPlatforms(platforms: SupportedPlatforms[], content: SocialPost): Promise<MultiPlatformResult>`
- `postToPlatform(platform: SupportedPlatforms, content: SocialPost): Promise<PostingResult>`
- `getConfiguredPlatforms(): string[]`
- `isPlatformConfigured(platform: SupportedPlatforms): boolean`

### Types

```typescript
interface SocialPost {
  content: string;
  title?: string;
  url?: string;
  imageUrl?: string;
  tags?: string[];
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
```

---

## License

MIT License © [HyperDrift]

---

> ✦ _Open-source tools for the forgotten edge._

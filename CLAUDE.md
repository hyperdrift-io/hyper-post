# AGENTS.md - HyperPost

> Guidelines for AI agents working in this codebase.
>
> Also read: `~/dev/hyperdrift/AGENTS.md` — workspace-level context (deploy tooling, fleet management, HD infra).

## Project Overview

**HyperPost** is a unified social media posting CLI tool that publishes content to multiple social networks simultaneously. Built with TypeScript, it uses Prisma for database operations and supports Mastodon, Bluesky, Discord, Reddit, Dev.to, and Medium.

Part of the **HyperDrift** ecosystem - open-source tools for independent developers.

## Essential Commands

```bash
# Package manager - ALWAYS use pnpm
pnpm install              # Install dependencies
pnpm build                # Build with tsup (outputs to dist/)
pnpm dev                  # Watch mode development
pnpm test                 # Run Jest tests
pnpm lint                 # ESLint on src/**/*.ts
pnpm typecheck            # TypeScript type checking (tsc --noEmit)

# Database (Prisma with SQLite)
pnpm db:generate          # Generate Prisma client after schema changes
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Prisma Studio GUI
pnpm db:migrate           # Create migrations for production

# CLI testing
pnpm cli                  # Run CLI directly (node dist/cli.js)
hyper-post setup          # Interactive setup wizard
hyper-post post -c "..."  # Post to all platforms
hyper-post platforms      # List configured platforms
```

## Project Structure

```
src/
├── HyperPost.ts          # Main class - orchestrates multi-platform posting
├── cli.ts                # Commander-based CLI implementation
├── database.ts           # Prisma client singleton
├── index.ts              # Public API exports
├── setup.ts              # Interactive setup wizard
├── signup-manager.ts     # Manages credentials in ~/.config/hyper-post/
├── signup-templates.ts   # Platform signup requirements and templates
├── platforms/
│   ├── BasePlatform.ts   # Abstract base class for all platforms
│   ├── BlueskyPlatform.ts
│   ├── MastodonPlatform.ts
│   ├── DiscordPlatform.ts
│   ├── RedditPlatform.ts
│   ├── DevtoPlatform.ts
│   ├── MediumPlatform.ts
│   └── index.ts          # Platform exports
├── types/
│   └── index.ts          # TypeScript interfaces (SocialPost, PostingResult, etc.)
└── utils/
    └── contentFormat.ts  # MDX/Markdown detection and conversion for Medium

schema.prisma             # Database schema (SQLite default)
tsup.config.ts            # Build configuration (CJS + ESM)
```

## Architecture Patterns

### Platform Pattern

All platforms extend `BasePlatform` and implement:

```typescript
abstract class BasePlatform {
  abstract get name(): string;           // lowercase identifier
  abstract get displayName(): string;    // human-readable name
  abstract post(content: SocialPost): Promise<PostingResult>;
  abstract gatherAnalytics(postUrl: string): Promise<PostAnalytics>;
  abstract discoverPosts(limit?: number): Promise<...>;
  protected abstract getRequiredCredentials(): string[];
}
```

### Adding a New Platform

1. Create `src/platforms/NewPlatform.ts` extending `BasePlatform`
2. Export from `src/platforms/index.ts`
3. Add to `SupportedPlatforms` type in `src/types/index.ts`
4. Add initialization in `HyperPost.initializePlatforms()`
5. Add platform data in `HyperPost.initializeDatabase()`
6. Add signup requirements in `src/signup-templates.ts`

### Credential Storage

- User credentials stored in `~/.config/hyper-post/signup-data.json`
- Config defaults in `~/.config/hyper-post/config.json`
- `SignupManager` class handles all credential operations
- Environment variables override stored credentials

### Database Schema

```prisma
Post           # Content with SHA-256 hash for deduplication
Platform       # Platform metadata (mastodon, bluesky, etc.)
PostPlatform   # Many-to-many: which posts went to which platforms
PostAnalytics  # Engagement metrics per post-platform
ScheduledPost  # Future posts with status tracking
```

## Key Types

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

type SupportedPlatforms = 'mastodon' | 'bluesky' | 'discord' | 'reddit' | 'devto' | 'medium' | ...;
```

## Build System

- **tsup** bundles the project into `dist/`
- Three entry points: `index.ts` (library), `cli.ts` (CLI), `setup.ts` (wizard)
- CLI and setup get `#!/usr/bin/env node` banner
- Library outputs both CJS and ESM
- TypeScript target: ES2022

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use `async/await` for all async operations
- Return `PostingResult` objects from platform `post()` methods
- Use `createResult()` helper in platforms for consistent returns

### Error Handling
- Platforms catch errors and return failure results (don't throw)
- Use `console.warn()` for non-fatal issues (analytics failures, etc.)
- CLI uses `process.exit(1)` for fatal errors

### Naming
- Platform classes: `{Name}Platform` (e.g., `BlueskyPlatform`)
- Platform identifiers: lowercase (e.g., `bluesky`)
- Credential keys: camelCase (e.g., `accessToken`, `integrationToken`)

### Imports
- Use named imports
- Platform implementations use `require()` for some packages (e.g., `mastodon-api`)
- Group imports: external packages, then internal modules

## Testing

- Jest is configured but no test files exist yet
- Test commands exist in `package.json`
- Recommended: add tests in `__tests__/` or `*.test.ts` files

## CLI Commands

| Command | Description |
|---------|-------------|
| `post` | Post content to platforms (`-c`, `-t`, `-u`, `--tags`, `-p`, `--dry-run`) |
| `platforms` | List/test configured platforms |
| `setup` | Interactive setup wizard |
| `history` | View posting history |
| `analytics` | View engagement data |
| `gather-analytics` | Fetch fresh metrics from platforms |
| `discover-posts` | Find existing posts on platforms |
| `import-post` | Import external post for tracking |
| `repost` | Repost content to additional platforms |
| `schedule` | Schedule future posts |
| `schedule-list` | List scheduled posts |
| `schedule-cancel` | Cancel scheduled post |
| `schedule-run` | Process due posts (for cron) |
| `promote` | **Blog promotion** - parse MDX posts and share to platforms |

### Blog Promotion (`promote`)

The `promote` command reads MDX blog posts from a content directory and posts them to social platforms:

```bash
# List available blog posts
hyper-post promote --list

# Promote a specific article
hyper-post promote --slug revela-part-1-architecture --dry-run

# Promote with full content to Dev.to/Medium
hyper-post promote --slug my-article --full-content

# Schedule promotion for later
hyper-post promote --slug my-article --schedule "2025-02-01 10:00"

# Promote recent posts (last 7 days)
hyper-post promote --recent 7

# Custom blog directory
hyper-post promote --blog-dir /path/to/content/blog --base-url https://mysite.com
```

Default blog directory: `/Users/yann/dev/hyperdrift-io/hyper-drift/content/blog`

## Platform-Specific Notes

### Medium
- Requires Markdown content format
- Uses `contentFormat.ts` utilities for MDX → Markdown conversion
- Tags limited to 5, max 25 chars each
- Hashtags extracted from content automatically

### Bluesky
- Uses `@atproto/api` SDK
- Creates rich text with facets for link detection
- URL embeds created as `app.bsky.embed.external`

### Mastodon
- Uses `mastodon-api` npm package
- Instance URL required in credentials
- Tags appended as hashtags to status text

### Discord
- Uses `discord.js`
- Requires bot token and channel ID
- Posts as bot messages

## Gotchas

1. **Build before CLI testing**: Always run `pnpm build` before testing CLI changes
2. **Prisma generation**: Run `pnpm db:generate` after any `schema.prisma` changes
3. **Duplicate detection**: Content is hashed (title + content + url) with 24-hour window
4. **Platform initialization**: Database platforms are upserted on `HyperPost` construction
5. **Medium content**: Must be Markdown - MDX auto-converted, plain text rejected
6. **Credential precedence**: Environment variables override stored credentials
7. **pnpm only**: Project uses pnpm workspace - don't use npm or yarn

## Dependencies

Key production dependencies:
- `@atproto/api` - Bluesky API
- `@prisma/client` - Database ORM
- `axios` - HTTP client (Medium, Dev.to, Reddit)
- `commander` - CLI framework
- `discord.js` - Discord API
- `mastodon-api` - Mastodon API
- `@mdx-js/mdx` / `remark` - Content format conversion
- `zod` - Schema validation

## File Locations

- Config: `~/.config/hyper-post/`
- Database: `./hyperpost.db` (SQLite, in project root)
- Built output: `./dist/`
- Source: `./src/`

## Integration with HyperDrift Blog

HyperPost is designed to promote articles from the HyperDrift blog (`/Users/yann/dev/hyperdrift-io/hyper-drift/content/blog`).

### Workflow for New Blog Posts

1. **Write the article** in MDX format with frontmatter:
   ```yaml
   ---
   title: "Article Title"
   date: "2025-02-01T10:00:00Z"
   excerpt: "Brief summary for social posts"
   tags: ["tag1", "tag2"]
   ---
   ```

2. **Preview the promotion**:
   ```bash
   hyper-post promote --slug article-slug --dry-run
   ```

3. **Post to all platforms**:
   ```bash
   hyper-post promote --slug article-slug
   ```

4. **Or schedule for optimal timing**:
   ```bash
   hyper-post promote --slug article-slug --schedule "2025-02-01 10:00"
   ```

### Platform Strategy

- **Short-form** (Mastodon, Bluesky): Uses excerpt
- **Long-form** (Dev.to, Medium): Use `--full-content` for cross-posting the full article

### Currently Configured Platforms

Run `hyper-post platforms` to see active platforms. As of now:
- Mastodon (mastodon.social/@hyperdrift)
- Bluesky (hyper-drift.bsky.social)
- Dev.to (dev.to/hyperdrift)

### Missing Platforms to Consider

- **Reddit** - Requires OAuth setup (client_id, client_secret, username, password)
- **Medium** - Requires integration token
- **Discord** - Requires bot token and channel ID
- **Hashnode** - Developer blogging platform (not yet implemented)
- **Daily.dev** - Content aggregation via Squads (not yet implemented)

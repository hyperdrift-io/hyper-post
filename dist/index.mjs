var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/platforms/BasePlatform.ts
var BasePlatform = class {
  credentials;
  constructor(credentials) {
    this.credentials = credentials;
  }
  validateCredentials() {
    const requiredFields = this.getRequiredCredentials();
    const missing = requiredFields.filter((field) => !this.credentials[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required credentials for ${this.displayName}: ${missing.join(", ")}`);
    }
  }
  createResult(success, postId, url, error) {
    return {
      platform: this.name,
      success,
      postId,
      url,
      error
    };
  }
};

// src/platforms/MastodonPlatform.ts
var Mastodon = __require("mastodon-api");
var MastodonPlatform = class extends BasePlatform {
  get name() {
    return "mastodon";
  }
  get displayName() {
    return "Mastodon";
  }
  getRequiredCredentials() {
    return ["instance", "accessToken"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      let status = content.content;
      if (content.title) {
        status = `${content.title}

${content.content}`;
      }
      if (content.url) {
        status += `

${content.url}`;
      }
      if (content.tags && content.tags.length > 0) {
        const tagString = content.tags.map((tag) => `#${tag}`).join(" ");
        status += `

${tagString}`;
      }
      const response = await client.post("statuses", {
        status,
        visibility: "public"
      });
      return this.createResult(
        true,
        response.data.id,
        response.data.url
      );
    } catch (error) {
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const urlMatch = postUrl.match(/\/@[^\/]+\/(\d+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Mastodon URL format: ${postUrl}`);
      }
      const statusId = urlMatch[1];
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      const response = await client.get(`statuses/${statusId}`);
      const status = response.data;
      return {
        likes: status.favourites_count || 0,
        reposts: status.reblogs_count || 0,
        replies: status.replies_count || 0,
        bookmarks: status.bookmarks_count || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Mastodon analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      const accountResponse = await client.get("accounts/verify_credentials");
      const account = accountResponse.data;
      const statusesResponse = await client.get(`accounts/${account.id}/statuses`, {
        limit
      });
      const posts = statusesResponse.data.map((status) => ({
        url: status.url,
        content: status.content.replace(/<[^>]*>/g, ""),
        // Remove HTML tags
        createdAt: new Date(status.created_at),
        analytics: {
          likes: status.favourites_count || 0,
          reposts: status.reblogs_count || 0,
          replies: status.replies_count || 0,
          bookmarks: status.bookmarks_count || 0
        }
      }));
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Mastodon posts:`, error);
      return [];
    }
  }
};

// src/platforms/BlueskyPlatform.ts
import { BskyAgent, RichText } from "@atproto/api";
var BlueskyPlatform = class extends BasePlatform {
  agent;
  constructor(credentials) {
    super(credentials);
    this.agent = new BskyAgent({ service: "https://bsky.social" });
  }
  get name() {
    return "bluesky";
  }
  get displayName() {
    return "Bluesky";
  }
  getRequiredCredentials() {
    return ["identifier", "password"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      let postText = content.content;
      if (content.title) {
        postText = `${content.title}

${content.content}`;
      }
      const rt = new RichText({ text: postText });
      await rt.detectFacets(this.agent);
      const postData = {
        text: rt.text,
        facets: rt.facets
      };
      if (content.url) {
        postData.embed = {
          $type: "app.bsky.embed.external",
          external: {
            uri: content.url,
            title: content.title || "Link",
            description: content.content.substring(0, 200)
          }
        };
      }
      const response = await this.agent.post(postData);
      return this.createResult(
        true,
        response.uri,
        `https://bsky.app/profile/${identifier}/post/${response.uri.split("/").pop()}`
      );
    } catch (error) {
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const urlMatch = postUrl.match(/\/profile\/([^\/]+)\/post\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Bluesky URL format: ${postUrl}`);
      }
      const username = urlMatch[1];
      const postId = urlMatch[2];
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      const threadResponse = await this.agent.getPostThread({
        uri: `at://${username}/app.bsky.feed.post/${postId}`
      });
      const post = threadResponse.data.thread.post;
      return {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        views: post.viewCount || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Bluesky analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      const profile = await this.agent.getProfile({ actor: identifier });
      const response = await this.agent.getAuthorFeed({
        actor: identifier,
        limit
      });
      const posts = response.data.feed.map((item) => {
        const post = item.post;
        const record = post.record;
        return {
          url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`,
          content: record.text || "",
          createdAt: new Date(record.createdAt),
          analytics: {
            likes: post.likeCount || 0,
            reposts: post.repostCount || 0,
            replies: post.replyCount || 0,
            views: post.viewCount || 0
          }
        };
      });
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Bluesky posts:`, error);
      return [];
    }
  }
};

// src/platforms/DiscordPlatform.ts
import { Client, GatewayIntentBits } from "discord.js";
var DiscordPlatform = class extends BasePlatform {
  client;
  constructor(credentials) {
    super(credentials);
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
    });
  }
  get name() {
    return "discord";
  }
  get displayName() {
    return "Discord";
  }
  getRequiredCredentials() {
    return ["token", "channelId"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { token, channelId } = this.credentials;
      await this.client.login(token);
      await new Promise((resolve) => {
        if (this.client.isReady()) {
          resolve();
        } else {
          this.client.once("ready", () => resolve());
        }
      });
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error("Channel not found");
      }
      let message = content.content;
      if (content.title) {
        message = `**${content.title}**

${content.content}`;
      }
      if (content.url) {
        message += `

${content.url}`;
      }
      const sentMessage = await channel.send(message);
      await this.client.destroy();
      return this.createResult(
        true,
        sentMessage.id,
        sentMessage.url
      );
    } catch (error) {
      if (this.client) {
        await this.client.destroy();
      }
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const urlMatch = postUrl.match(/\/channels\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Discord URL format: ${postUrl}`);
      }
      const [, guildId, channelId, messageId] = urlMatch;
      const { token } = this.credentials;
      this.client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
      });
      await this.client.login(token);
      const channel = await this.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);
      const totalReactions = message.reactions.cache.reduce((total, reaction) => {
        return total + reaction.count;
      }, 0);
      await this.client.destroy();
      return {
        likes: totalReactions,
        // reactions as likes
        replies: 0
        // Discord doesn't expose reply counts easily
      };
    } catch (error) {
      console.warn(`Failed to gather Discord analytics for ${postUrl}:`, error);
      if (this.client) {
        await this.client.destroy();
      }
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account (not well supported by Discord API)
   */
  async discoverPosts(limit = 20) {
    console.warn("Discord post discovery not implemented - Discord API limitations");
    return [];
  }
};

// src/platforms/RedditPlatform.ts
import axios from "axios";
var RedditPlatform = class extends BasePlatform {
  accessToken = null;
  get name() {
    return "reddit";
  }
  get displayName() {
    return "Reddit";
  }
  getRequiredCredentials() {
    return ["clientId", "clientSecret", "username", "password"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const { subreddit = "hyperdrift" } = this.credentials;
      const postData = {
        title: content.title || "New Post",
        text: content.content,
        kind: "self",
        // Text post
        sr: subreddit
      };
      if (content.url) {
        postData.kind = "link";
        postData.url = content.url;
        if (content.content) {
          postData.text = content.content;
        }
      }
      const response = await axios.post(
        "https://oauth.reddit.com/api/submit",
        new URLSearchParams(postData).toString(),
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data.success) {
        const postId = response.data.jquery?.[10]?.[3]?.[0]?.data?.id;
        const postUrl = `https://reddit.com/r/${subreddit}/comments/${postId}`;
        return this.createResult(true, postId, postUrl);
      } else {
        return this.createResult(false, void 0, void 0, "Reddit API submission failed");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        this.accessToken = null;
        try {
          await this.authenticate();
          return this.post(content);
        } catch (retryError) {
          return this.createResult(false, void 0, void 0, "Authentication failed");
        }
      }
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.message || error.message || "Unknown error"
      );
    }
  }
  async authenticate() {
    try {
      const { clientId, clientSecret, username, password } = this.credentials;
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const response = await axios.post(
        "https://www.reddit.com/api/v1/access_token",
        new URLSearchParams({
          grant_type: "password",
          username,
          password
        }).toString(),
        {
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
      } else {
        throw new Error("Failed to get access token");
      }
    } catch (error) {
      throw new Error(`Reddit authentication failed: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const urlMatch = postUrl.match(/\/r\/[^\/]+\/comments\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Reddit URL format: ${postUrl}`);
      }
      const postId = urlMatch[1];
      const response = await axios.get(
        `https://oauth.reddit.com/by_id/t3_${postId}`,
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data && response.data.data && response.data.data.children.length > 0) {
        const post = response.data.data.children[0].data;
        return {
          likes: post.score || 0,
          // upvotes - downvotes
          replies: post.num_comments || 0,
          views: post.view_count || 0,
          reposts: post.num_crossposts || 0
        };
      }
      return {};
    } catch (error) {
      console.warn(`Failed to gather Reddit analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const { username } = this.credentials;
      const response = await axios.get(`https://oauth.reddit.com/user/${username}/submitted`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
        },
        params: {
          limit,
          sort: "new"
        }
      });
      const posts = response.data.data.children.map((child) => {
        const post = child.data;
        return {
          url: `https://www.reddit.com${post.permalink}`,
          content: post.selftext || post.title,
          createdAt: new Date(post.created_utc * 1e3),
          analytics: {
            likes: post.score || 0,
            reposts: 0,
            // Reddit doesn't have reposts
            replies: post.num_comments || 0,
            views: 0
            // Reddit doesn't expose view counts easily
          }
        };
      });
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Reddit posts:`, error);
      return [];
    }
  }
};

// src/platforms/DevtoPlatform.ts
import axios2 from "axios";
var DevtoPlatform = class extends BasePlatform {
  get name() {
    return "devto";
  }
  get displayName() {
    return "Dev.to";
  }
  getRequiredCredentials() {
    return ["apiKey"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const articleData = {
        article: {
          title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? "..." : ""),
          body_markdown: content.content,
          published: true,
          tags: content.tags || [],
          canonical_url: content.url
        }
      };
      const response = await axios2.post("https://dev.to/api/articles", articleData, {
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json"
        }
      });
      const article = response.data;
      return this.createResult(
        true,
        article.id.toString(),
        article.url
      );
    } catch (error) {
      console.error("Dev.to posting error:", error.response?.data || error.message);
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.error || error.message
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const urlMatch = postUrl.match(/\/([^\/]+)\/([^\/\-]+)(?:-([a-z0-9]+))?$/);
      if (!urlMatch) {
        throw new Error(`Invalid Dev.to URL format: ${postUrl}`);
      }
      const username = urlMatch[1];
      const slug = urlMatch[2];
      const id = urlMatch[3];
      let article;
      if (id) {
        const response = await axios2.get(`https://dev.to/api/articles/${id}`, {
          headers: {
            "Api-Key": apiKey
          }
        });
        article = response.data;
      } else {
        const response = await axios2.get("https://dev.to/api/articles/me", {
          headers: {
            "Api-Key": apiKey
          }
        });
        const articles = response.data;
        article = articles.find((a) => a.slug === slug || a.slug.startsWith(slug));
      }
      if (!article) {
        console.warn(`Could not find Dev.to article for URL: ${postUrl}`);
        return {};
      }
      return {
        likes: article.positive_reactions_count || 0,
        reposts: 0,
        // Dev.to doesn't have reposts
        replies: article.comments_count || 0,
        views: article.page_views_count || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Dev.to analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }
  /**
   * Discover recent articles from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const response = await axios2.get("https://dev.to/api/articles/me/published", {
        headers: {
          "Api-Key": apiKey
        },
        params: {
          per_page: Math.min(limit, 100)
          // Dev.to limits to 100 per page
        }
      });
      const articles = response.data;
      return articles.map((article) => ({
        url: article.url,
        content: article.body_markdown || article.description || article.title,
        createdAt: new Date(article.created_at),
        analytics: {
          likes: article.positive_reactions_count || 0,
          reposts: 0,
          replies: article.comments_count || 0,
          views: article.page_views_count || 0
        }
      }));
    } catch (error) {
      console.warn(`Failed to discover Dev.to posts:`, error.response?.data || error.message);
      return [];
    }
  }
};

// src/platforms/MediumPlatform.ts
import axios3 from "axios";
var MediumPlatform = class extends BasePlatform {
  get name() {
    return "medium";
  }
  get displayName() {
    return "Medium";
  }
  getRequiredCredentials() {
    return ["integrationToken"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const userResponse = await axios3.get("https://api.medium.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        }
      });
      const userId = userResponse.data.data.id;
      const postData = {
        title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? "..." : ""),
        contentFormat: "markdown",
        content: content.content,
        canonicalUrl: content.url,
        tags: content.tags || [],
        publishStatus: "public"
      };
      const response = await axios3.post(`https://api.medium.com/v1/users/${userId}/posts`, postData, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        }
      });
      const post = response.data.data;
      return this.createResult(
        true,
        post.id,
        post.url
      );
    } catch (error) {
      console.error("Medium posting error:", error.response?.data || error.message);
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.errors?.[0]?.message || error.message
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const urlMatch = postUrl.match(/\/([^\/]+)$/);
      if (!urlMatch) {
        throw new Error(`Invalid Medium URL format: ${postUrl}`);
      }
      const postId = urlMatch[1];
      const response = await axios3.get(`https://api.medium.com/v1/posts/${postId}`, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        }
      });
      const post = response.data.data;
      return {
        likes: post.clapCount || 0,
        replies: 0,
        // Medium doesn't expose comment counts easily
        views: 0,
        // Medium doesn't expose view counts in API
        bookmarks: post.voterCount || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Medium analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const userResponse = await axios3.get("https://api.medium.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        }
      });
      const userId = userResponse.data.data.id;
      const postsResponse = await axios3.get(`https://api.medium.com/v1/users/${userId}/posts`, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        },
        params: {
          limit: Math.min(limit, 50)
          // Medium limits to 50
        }
      });
      const posts = postsResponse.data.data;
      return posts.map((post) => ({
        url: post.url,
        content: post.title + "\n\n" + (post.virtuals?.subtitle || ""),
        createdAt: new Date(post.createdAt),
        analytics: {
          likes: post.clapCount || 0,
          replies: 0,
          views: 0,
          bookmarks: post.voterCount || 0
        }
      }));
    } catch (error) {
      console.warn(`Failed to discover Medium posts:`, error.response?.data || error.message);
      return [];
    }
  }
};

// src/HyperPost.ts
import * as crypto from "crypto";

// src/database.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["error", "warn"]
});
if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;

// src/HyperPost.ts
var HyperPost = class {
  platforms = /* @__PURE__ */ new Map();
  duplicateCheckWindow = 24 * 60 * 60 * 1e3;
  // 24 hours in milliseconds
  constructor(credentials) {
    this.initializePlatforms(credentials);
    this.initializeDatabase();
  }
  /**
   * Initialize database tables and ensure platforms exist
   */
  async initializeDatabase() {
    try {
      const platformData = [
        { name: "mastodon", displayName: "Mastodon" },
        { name: "bluesky", displayName: "Bluesky" },
        { name: "reddit", displayName: "Reddit" },
        { name: "discord", displayName: "Discord" },
        { name: "devto", displayName: "Dev.to" },
        { name: "medium", displayName: "Medium" }
      ];
      for (const platform of platformData) {
        await prisma.platform.upsert({
          where: { name: platform.name },
          update: { displayName: platform.displayName },
          create: platform
        });
      }
    } catch (error) {
      console.warn("Database initialization warning:", error);
    }
  }
  /**
   * Generate content hash for deduplication
   */
  generateContentHash(content) {
    const contentString = `${content.title || ""}|${content.content}|${content.url || ""}`;
    return crypto.createHash("sha256").update(contentString).digest("hex");
  }
  /**
   * Check if content has been posted recently to a specific platform
   */
  async isDuplicate(content, platformName) {
    try {
      const contentHash = this.generateContentHash(content);
      const cutoffTime = new Date(Date.now() - this.duplicateCheckWindow);
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
      const postedToThisPlatform = post.postPlatforms.length > 0;
      const postedTo = post.postPlatforms.map((pp) => pp.platform.name);
      return {
        isDuplicate: postedToThisPlatform,
        postedTo,
        lastPosted: post.postPlatforms[0]?.postedAt
      };
    } catch (error) {
      console.warn("Database query failed, falling back to allowing post:", error);
      return { isDuplicate: false, postedTo: [] };
    }
  }
  /**
   * Record a successful post
   */
  async recordPost(content, platformName, result) {
    if (!result.success || !result.url)
      return;
    try {
      const contentHash = this.generateContentHash(content);
      const platform = await prisma.platform.findUnique({
        where: { name: platformName }
      });
      if (!platform) {
        console.warn(`Platform ${platformName} not found in database`);
        return;
      }
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
      await prisma.postPlatform.create({
        data: {
          postId: post.id,
          platformId: platform.id,
          postUrl: result.url
        }
      });
    } catch (error) {
      console.warn("Failed to record post in database:", error);
    }
  }
  initializePlatforms(credentials) {
    if (credentials.mastodon) {
      this.platforms.set("mastodon", new MastodonPlatform(credentials.mastodon));
    }
    if (credentials.bluesky) {
      this.platforms.set("bluesky", new BlueskyPlatform(credentials.bluesky));
    }
    if (credentials.discord) {
      this.platforms.set("discord", new DiscordPlatform(credentials.discord));
    }
    if (credentials.reddit) {
      this.platforms.set("reddit", new RedditPlatform(credentials.reddit));
    }
    if (credentials.devto) {
      this.platforms.set("devto", new DevtoPlatform(credentials.devto));
    }
    if (credentials.medium) {
      this.platforms.set("medium", new MediumPlatform(credentials.medium));
    }
  }
  /**
   * Post to a single platform
   */
  async postToPlatform(platform, content) {
    const platformInstance = this.platforms.get(platform);
    if (!platformInstance) {
      return {
        platform,
        success: false,
        error: `Platform ${platform} not configured or credentials missing`
      };
    }
    const duplicateCheck = await this.isDuplicate(content, platform);
    if (duplicateCheck.isDuplicate) {
      const lastPosted = duplicateCheck.lastPosted ? ` (last posted: ${duplicateCheck.lastPosted.toLocaleString()})` : "";
      return {
        platform,
        success: false,
        error: `Duplicate content: This post was already sent to ${platform} recently${lastPosted}. Previously posted to: ${duplicateCheck.postedTo.join(", ")}`
      };
    }
    const result = await platformInstance.post(content);
    await this.recordPost(content, platform, result);
    return result;
  }
  /**
   * Post to all configured platforms
   */
  async postToAll(content) {
    const results = [];
    let successful = 0;
    let failed = 0;
    const promises = Array.from(this.platforms.entries()).map(async ([name, platform]) => {
      const result = await this.postToPlatform(name, content);
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
  async postToPlatforms(platforms, content) {
    const results = [];
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
  async getPostedContentHistory(limit = 50) {
    try {
      const posts = await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          postPlatforms: {
            include: {
              platform: true
            }
          }
        }
      });
      return posts.map((post) => ({
        contentHash: post.contentHash,
        title: post.title,
        content: post.content,
        url: post.url,
        platforms: post.postPlatforms.map((pp) => pp.platform.name),
        timestamp: post.createdAt.getTime(),
        postUrls: post.postPlatforms.map((pp) => ({
          platform: pp.platform.name,
          url: pp.postUrl,
          postedAt: pp.postedAt
        }))
      }));
    } catch (error) {
      console.warn("Failed to fetch posting history:", error);
      return [];
    }
  }
  /**
   * Clear posted content history
   */
  async clearPostedContentHistory() {
    try {
      await prisma.postPlatform.deleteMany();
      await prisma.post.deleteMany();
      console.log("\u2705 Posting history cleared from database.");
    } catch (error) {
      console.warn("Failed to clear posting history:", error);
    }
  }
  /**
   * Get posting analytics
   */
  async getPostingAnalytics(platform, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
      const analytics = await prisma.postPlatform.findMany({
        where: {
          postedAt: { gte: startDate },
          ...platform && {
            platform: { name: platform }
          }
        },
        include: {
          platform: true,
          post: true,
          analytics: true
        },
        orderBy: { postedAt: "desc" }
      });
      return {
        totalPosts: analytics.length,
        byPlatform: analytics.reduce((acc, item) => {
          acc[item.platform.name] = (acc[item.platform.name] || 0) + 1;
          return acc;
        }, {}),
        recentPosts: analytics.slice(0, 10),
        engagementData: analytics.map((item) => ({
          platform: item.platform.name,
          postTitle: item.post.title,
          url: item.postUrl,
          postedAt: item.postedAt,
          metrics: item.analytics.reduce((acc, metric) => {
            acc[metric.metric] = metric.value;
            return acc;
          }, {})
        }))
      };
    } catch (error) {
      console.warn("Failed to fetch analytics:", error);
      return { totalPosts: 0, byPlatform: {}, recentPosts: [], engagementData: [] };
    }
  }
  /**
   * Gather analytics for all posts
   */
  async gatherAnalyticsForAllPosts() {
    try {
      const results = [];
      let totalProcessed = 0;
      let totalUpdated = 0;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
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
          if (!platformInstance)
            continue;
          totalProcessed++;
          const analytics = await platformInstance.gatherAnalytics(postPlatform.postUrl);
          for (const [metric, value] of Object.entries(analytics)) {
            if (value !== void 0) {
              await prisma.postAnalytics.upsert({
                where: {
                  postPlatformId_metric: {
                    postPlatformId: postPlatform.id,
                    metric
                  }
                },
                update: {
                  value: value || 0,
                  recordedAt: /* @__PURE__ */ new Date()
                  // Update timestamp when we refresh analytics
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
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } catch (error) {
          results.push({
            platform: postPlatform.platform.name,
            url: postPlatform.postUrl,
            error: error instanceof Error ? error.message : "Unknown error",
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
      console.warn("Failed to gather analytics for posts:", error);
      return { processed: 0, updated: 0, results: [] };
    }
  }
  /**
   * Set duplicate check window (in hours)
   */
  setDuplicateCheckWindow(hours) {
    this.duplicateCheckWindow = hours * 60 * 60 * 1e3;
  }
  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms() {
    return Array.from(this.platforms.keys());
  }
  /**
   * Check if a platform is configured
   */
  isPlatformConfigured(platform) {
    return this.platforms.has(platform);
  }
  /**
   * Get a specific platform instance
   */
  getPlatform(platformName) {
    return this.platforms.get(platformName);
  }
};
export {
  BlueskyPlatform,
  DiscordPlatform,
  HyperPost,
  MastodonPlatform
};
//# sourceMappingURL=index.mjs.map
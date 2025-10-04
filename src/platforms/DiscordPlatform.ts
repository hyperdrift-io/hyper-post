import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

export class DiscordPlatform extends BasePlatform {
  private client: Client;

  constructor(credentials: Record<string, string>) {
    super(credentials);
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
    });
  }

  get name(): string {
    return 'discord';
  }

  get displayName(): string {
    return 'Discord';
  }

  protected getRequiredCredentials(): string[] {
    return ['token', 'channelId'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();

      const { token, channelId } = this.credentials;

      // Login to Discord
      await this.client.login(token);

      // Wait for client to be ready
      await new Promise<void>((resolve) => {
        if (this.client.isReady()) {
          resolve();
        } else {
          this.client.once('ready', () => resolve());
        }
      });

      // Get the channel
      const channel = await this.client.channels.fetch(channelId) as TextChannel;

      if (!channel) {
        throw new Error('Channel not found');
      }

      // Prepare the message content
      let message = content.content;

      if (content.title) {
        message = `**${content.title}**\n\n${content.content}`;
      }

      // Add URL if provided
      if (content.url) {
        message += `\n\n${content.url}`;
      }

      // Send the message
      const sentMessage = await channel.send(message);

      // Logout
      await this.client.destroy();

      return this.createResult(
        true,
        sentMessage.id,
        sentMessage.url
      );

    } catch (error) {
      // Make sure to destroy client on error
      if (this.client) {
        await this.client.destroy();
      }

      return this.createResult(
        false,
        undefined,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async gatherAnalytics(postUrl: string): Promise<PostAnalytics> {
    try {
      this.validateCredentials();

      // Extract message information from Discord URL
      // URL format: https://discord.com/channels/guildId/channelId/messageId
      const urlMatch = postUrl.match(/\/channels\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Discord URL format: ${postUrl}`);
      }

      const [, guildId, channelId, messageId] = urlMatch;

      const { token } = this.credentials;

      // Initialize Discord client
      this.client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
      });

      await this.client.login(token);

      // Get the message
      const channel = await this.client.channels.fetch(channelId) as TextChannel;
      const message = await channel.messages.fetch(messageId);

      // Count reactions
      const totalReactions = message.reactions.cache.reduce((total, reaction) => {
        return total + reaction.count;
      }, 0);

      // Logout
      await this.client.destroy();

      return {
        likes: totalReactions, // reactions as likes
        replies: 0 // Discord doesn't expose reply counts easily
      };

    } catch (error) {
      console.warn(`Failed to gather Discord analytics for ${postUrl}:`, error);
      // Make sure to destroy client on error
      if (this.client) {
        await this.client.destroy();
      }
      return {};
    }
  }

  /**
   * Discover recent posts from the user's account (not well supported by Discord API)
   */
  async discoverPosts(limit: number = 20): Promise<Array<{url: string, content: string, createdAt: Date, analytics: PostAnalytics}>> {
    // Discord API doesn't provide a good way to discover user's own posts
    // This would require searching through channels the bot has access to
    console.warn('Discord post discovery not implemented - Discord API limitations');
    return [];
  }
}

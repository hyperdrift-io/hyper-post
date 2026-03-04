import { BasePlatform, PostAnalytics } from './BasePlatform';
import { SocialPost, PostingResult } from '../types';

/**
 * Telegram platform — posts to channels or groups via the Bot API.
 *
 * Credentials (stored in ~/.config/hyper-post/credentials.json under 'telegram'):
 *   botToken  — from @BotFather: /newbot
 *   chatId    — channel username (@mychannel) or numeric group ID (-100xxxxxxxxxx)
 *
 * Setup:
 *   1. Message @BotFather on Telegram → /newbot → copy the token
 *   2. Add the bot as admin to your channel/group
 *   3. Run: hyper-post setup (select telegram, enter botToken + chatId)
 *
 * Multiple targets: create separate platform configs (e.g. telegram-defi, telegram-general)
 * by running setup again with a different chatId.
 */
export class TelegramPlatform extends BasePlatform {
  private readonly API_BASE = 'https://api.telegram.org';

  get name(): string {
    return 'telegram';
  }

  get displayName(): string {
    return 'Telegram';
  }

  protected getRequiredCredentials(): string[] {
    return ['botToken', 'chatId'];
  }

  async post(content: SocialPost): Promise<PostingResult> {
    try {
      this.validateCredentials();
      const { botToken, chatId } = this.credentials;

      const text = this.formatMessage(content);

      const response = await fetch(
        `${this.API_BASE}/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
          }),
        }
      );

      const data = await response.json() as { ok: boolean; result?: { message_id: number }; description?: string };

      if (!data.ok) {
        return {
          platform: this.name,
          success: false,
          error: data.description ?? 'Unknown Telegram API error',
        };
      }

      const messageId = data.result?.message_id;
      return {
        platform: this.name,
        success: true,
        postId: String(messageId),
        url: chatId.startsWith('@')
          ? `https://t.me/${chatId.slice(1)}/${messageId}`
          : undefined,
      };
    } catch (error: unknown) {
      return {
        platform: this.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private formatMessage(content: SocialPost): string {
    const parts: string[] = [];

    if (content.title) {
      parts.push(`*${content.title}*`);
    }

    parts.push(content.content);

    if (content.url) {
      parts.push(content.url);
    }

    if (content.tags && content.tags.length > 0) {
      parts.push(content.tags.map(t => `#${t.replace(/\s+/g, '_')}`).join(' '));
    }

    return parts.join('\n\n');
  }

  async gatherAnalytics(_postUrl: string): Promise<PostAnalytics> {
    // Telegram Bot API does not expose view/reaction counts for channel posts
    // without special admin permissions — return empty for now
    return {};
  }

  async discoverPosts(_limit?: number): Promise<Array<{ url: string; content: string; createdAt: Date; analytics: PostAnalytics }>> {
    // Telegram Bot API does not support retrieving channel history
    return [];
  }
}

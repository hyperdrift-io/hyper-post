import { prisma } from '../database';
import { loadGrowthConfig } from '../growth-config';
import { fetchHotMentionSignals, fetchRedditSignals, saveSignals } from '../integrations/hotmention';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync } from 'fs';

export interface ListenOptions {
  appDir?: string;
  minScore?: number;
  since?: string;   // e.g. '24h', '7d'
  dryRun?: boolean;
}

/**
 * Fetch new intent signals for an app and store them as Drafts for reply review.
 * Uses HotMention if API key configured, otherwise falls back to Reddit search.
 */
export async function listenForSignals(appName: string, options: ListenOptions = {}): Promise<void> {
  const appDir = options.appDir ?? join(process.env.HYPERDRIFT_APPS ?? `${homedir()}/dev/hyperdrift/apps`, appName);
  const minScore = options.minScore ?? 50;

  const config = loadGrowthConfig(appDir);
  if (!config) {
    console.error(`No GROWTH.md found in ${appDir}. Run: hyper-post launch ${appName} to create one.`);
    process.exit(1);
  }

  const keywords = config.intent_keywords ?? [];
  const subreddits = config.subreddits ?? [];

  if (keywords.length === 0) {
    console.error(`No intent_keywords defined in ${appDir}/GROWTH.md`);
    process.exit(1);
  }

  console.log(`\nListening for intent signals: ${appName}`);
  console.log(`Keywords: ${keywords.slice(0, 3).join(', ')}${keywords.length > 3 ? ` (+${keywords.length - 3} more)` : ''}`);
  console.log('');

  // Try HotMention first, fall back to Reddit
  const apiKey = loadHotMentionKey();
  let signals;

  if (apiKey) {
    console.log('Using HotMention (multi-platform)...');
    try {
      signals = await fetchHotMentionSignals(appName, keywords, apiKey, minScore);
    } catch (err) {
      console.warn(`HotMention failed: ${(err as Error).message}. Falling back to Reddit.`);
      signals = await fetchRedditSignals(subreddits, keywords);
    }
  } else {
    console.log('No HotMention API key found — using Reddit search (free).');
    console.log('Tip: sign up at hotmention.com for multi-platform coverage ($49/mo).\n');
    signals = await fetchRedditSignals(subreddits, keywords);
  }

  const filtered = signals.filter(s => s.intentScore >= minScore);
  console.log(`Found ${filtered.length} signals above score ${minScore} (${signals.length} total)`);

  if (options.dryRun || filtered.length === 0) {
    if (filtered.length > 0) {
      console.log('\nTop signals (dry run — not saved):');
      for (const s of filtered.slice(0, 5)) {
        console.log(`  [${s.intentScore}] ${s.platform} — ${s.title.slice(0, 70)}`);
        console.log(`       ${s.url}`);
      }
    }
    return;
  }

  const saved = await saveSignals(appName, filtered);
  console.log(`\nSaved ${saved} new signals (${filtered.length - saved} already seen)`);

  // Generate reply drafts for high-score signals
  const highScore = filtered.filter(s => s.intentScore >= 70);
  if (highScore.length > 0) {
    console.log(`\nGenerating reply drafts for ${highScore.length} high-intent signals...`);
    for (const signal of highScore) {
      const draft = generateReplyDraft(config.url, signal.title, signal.platform);
      await prisma.draft.create({
        data: {
          appName,
          platform: signal.platform,
          content: draft,
          metadata: JSON.stringify({ threadUrl: signal.url, threadTitle: signal.title }),
          status: 'draft',
          signal: { connect: { url: signal.url } },
        },
      });
    }
  }

  console.log('\nNext step: review and approve replies');
  console.log(`  hyper-post reply list --app ${appName}`);
}

/** Generate a value-first reply draft (human should personalise before posting) */
function generateReplyDraft(appUrl: string, threadTitle: string, _platform: string): string {
  return `[Review and personalise before posting]

The thread is asking about: "${threadTitle}"

Suggested approach:
1. Answer their specific question directly and genuinely
2. Only mention the tool if it directly solves what they're asking about
3. End with: "I built [App] for exactly this — [one-sentence value prop]. ${appUrl}"

Draft reply:
[Write a genuine answer to their question here. Be specific to their situation. 
Do not start with "I built" — lead with the answer, not the product.]`;
}

function loadHotMentionKey(): string | null {
  // Check env first
  if (process.env.HOTMENTION_API_KEY) return process.env.HOTMENTION_API_KEY;

  // Check credentials file
  const credsPath = join(homedir(), '.config', 'hyper-post', 'credentials.json');
  if (existsSync(credsPath)) {
    try {
      const creds = JSON.parse(readFileSync(credsPath, 'utf-8'));
      return creds?.hotmention?.apiKey ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

import { prisma } from '../database';

export interface HotMentionSignal {
  id: string;
  platform: string;
  url: string;
  title: string;
  excerpt: string;
  intentScore: number;
  draftReply?: string;
}

/**
 * HotMention integration — fetches pre-scored intent signals.
 * Requires HOTMENTION_API_KEY in env or ~/.config/hyper-post/credentials.json.
 *
 * Setup: sign up at hotmention.com → copy API key → add to credentials:
 *   hyper-post setup  (choose 'hotmention', enter API key)
 *
 * If no API key is configured, falls back to DIY Reddit search.
 */
export async function fetchHotMentionSignals(
  appName: string,
  keywords: string[],
  apiKey: string,
  minScore = 50
): Promise<HotMentionSignal[]> {
  const response = await fetch('https://api.hotmention.com/v1/signals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keywords,
      platforms: ['reddit', 'linkedin', 'quora', 'x'],
      min_intent_score: minScore,
      limit: 20,
    }),
  });

  if (!response.ok) {
    throw new Error(`HotMention API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { signals: HotMentionSignal[] };
  return data.signals ?? [];
}

/**
 * DIY fallback: searches Reddit via the public JSON API for threads matching keywords.
 * No API key required. Covers Reddit only.
 */
export async function fetchRedditSignals(
  subreddits: string[],
  keywords: string[]
): Promise<HotMentionSignal[]> {
  const signals: HotMentionSignal[] = [];
  const searchQuery = keywords.slice(0, 3).join(' OR ');

  for (const sub of subreddits.slice(0, 5)) {
    const subreddit = sub.replace(/^r\//, '');
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&limit=10&t=week`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'hyper-post/1.0 (intent signal monitor)' },
      });

      if (!response.ok) continue;

      const data = await response.json() as {
        data: { children: Array<{ data: { id: string; permalink: string; title: string; selftext: string; score: number } }> }
      };

      for (const post of data.data.children) {
        const { id, permalink, title, selftext, score } = post.data;
        const intentScore = scoreRedditPost(title, selftext, keywords);

        if (intentScore < 30) continue;

        signals.push({
          id,
          platform: 'reddit',
          url: `https://reddit.com${permalink}`,
          title,
          excerpt: selftext.slice(0, 300),
          intentScore: Math.min(100, intentScore + Math.min(20, Math.floor(score / 10))),
        });
      }
    } catch {
      // Skip subreddit on network error
    }
  }

  return signals.sort((a, b) => b.intentScore - a.intentScore);
}

/** Simple keyword-density intent scorer */
function scoreRedditPost(title: string, body: string, keywords: string[]): number {
  const text = `${title} ${body}`.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    if (title.toLowerCase().includes(kw)) score += 20;
    else if (text.includes(kw)) score += 10;
  }

  // Boost for question posts (high intent)
  if (title.includes('?') || /\b(how|what|best|recommend|suggest)\b/i.test(title)) {
    score += 15;
  }

  return score;
}

/** Persist signals to DB, skipping already-seen URLs */
export async function saveSignals(
  appName: string,
  signals: HotMentionSignal[]
): Promise<number> {
  let saved = 0;

  for (const signal of signals) {
    try {
      await prisma.intentSignal.create({
        data: {
          appName,
          platform: signal.platform,
          url: signal.url,
          title: signal.title,
          excerpt: signal.excerpt,
          intentScore: signal.intentScore,
          status: 'new',
        },
      });
      saved++;
    } catch {
      // Skip duplicate URLs (unique constraint)
    }
  }

  return saved;
}

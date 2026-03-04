import { prisma } from '../database';
import { loadGrowthConfig } from '../growth-config';
import { generateHNDraft } from '../generators/hackernews';
import { generateDirectoryChecklist, printDirectoryChecklist } from '../generators/directories';
import { join } from 'path';
import { homedir } from 'os';

export interface LaunchOptions {
  appDir?: string;
  dryRun?: boolean;
}

/**
 * Generate the full launch sequence as drafts (nothing is posted automatically).
 * Outputs:
 *   - Show HN draft (stored in DB + browser-open URL)
 *   - Reddit intro post draft (stored in DB)
 *   - Social blast drafts: Bluesky + Mastodon + Telegram if configured (stored in DB)
 *   - dev.to article draft (stored in DB)
 *   - Directory checklist (printed to stdout — manual submission)
 */
export async function generateLaunchDrafts(appName: string, options: LaunchOptions = {}): Promise<void> {
  const appDir = options.appDir
    ?? join(process.env.HYPERDRIFT_APPS ?? `${homedir()}/dev/hyperdrift/apps`, appName);

  const config = loadGrowthConfig(appDir);
  if (!config) {
    console.error(`No GROWTH.md found in ${appDir}`);
    console.error(`Create one using the template at meta/templates/GROWTH.md`);
    process.exit(1);
  }

  console.log(`\nGenerating launch sequence for: ${appName} (${config.url})\n`);

  const drafts: Array<{ platform: string; content: string; metadata: object }> = [];

  // 1. Show HN draft
  const hn = generateHNDraft(config);
  drafts.push({
    platform: 'hackernews',
    content: `Title: ${hn.title}\n\n${hn.openingComment}\n\nTips:\n${hn.tips.map(t => `• ${t}`).join('\n')}`,
    metadata: { title: hn.title, submitUrl: hn.submitUrl },
  });

  // 2. Reddit intro post (primary subreddit)
  const primarySub = config.subreddits?.[0] ?? 'r/SideProject';
  const redditPost = generateRedditIntroPost(config);
  drafts.push({
    platform: 'reddit',
    content: redditPost,
    metadata: { subreddit: primarySub, title: `I built ${appName} to solve [fill in problem]`, url: config.url },
  });

  // 3. Social blast — Bluesky
  const socialPost = generateSocialBlast(config);
  drafts.push({ platform: 'bluesky', content: socialPost, metadata: { url: config.url } });
  drafts.push({ platform: 'mastodon', content: socialPost, metadata: { url: config.url } });

  // Telegram if configured
  if (config.telegram_targets && config.telegram_targets.length > 0) {
    const telegramPost = generateTelegramPost(config);
    for (const target of config.telegram_targets) {
      drafts.push({
        platform: 'telegram',
        content: telegramPost,
        metadata: { chatId: target, url: config.url },
      });
    }
  }

  // 4. dev.to article draft
  const devtoArticle = generateDevtoArticle(config);
  drafts.push({
    platform: 'devto',
    content: devtoArticle,
    metadata: {
      title: `I built ${config.app} to solve [problem] — here's what I learned`,
      url: config.url,
      tags: config.aeo_target_questions?.slice(0, 4) ?? [],
    },
  });

  if (options.dryRun) {
    console.log(`Would create ${drafts.length} drafts:\n`);
    for (const d of drafts) {
      console.log(`  ${d.platform}: ${d.content.slice(0, 80).replace(/\n/g, ' ')}...`);
    }
  } else {
    let created = 0;
    for (const d of drafts) {
      await prisma.draft.create({
        data: {
          appName,
          platform: d.platform,
          content: d.content,
          metadata: JSON.stringify(d.metadata),
          status: 'draft',
        },
      });
      created++;
    }
    console.log(`Created ${created} drafts.\n`);
    console.log(`Review them: hyper-post reply list --app ${appName}`);
    console.log(`Approve one: hyper-post reply approve <id>`);
    console.log(`Post it:     hyper-post reply post <id>`);
  }

  // Directory checklist is always printed — not stored
  const checklist = generateDirectoryChecklist(config);
  printDirectoryChecklist(checklist, appName);

  if (config.awesome_list_targets && config.awesome_list_targets.length > 0) {
    console.log('Awesome-list PR targets (submit to get cited by AI engines):');
    for (const target of config.awesome_list_targets) {
      console.log(`  https://github.com/${target}`);
    }
    console.log('');
  }
}

function generateRedditIntroPost(config: ReturnType<typeof loadGrowthConfig>): string {
  if (!config) return '';
  return `[Personalise this before posting — generic posts get removed]

Title suggestion: "I built ${config.app} after [specific personal problem] — ${config.url}"

Body template:
---
I've been [doing X] for [time period] and [specific frustration].

I looked for tools to solve this and found [what existed and why it wasn't good enough].

So I built ${config.app}: [one clear sentence on what it does].

What's working: [honest early signal]
What needs improvement: [genuine limitation — authenticity builds trust]

If you've struggled with [problem], I'd love your feedback.

${config.url}
---

Posting tips:
• Use the thread's specific pain point in your first sentence
• The title must NOT sound like marketing — state what it is, not why it's great
• Reply to every comment within the first hour
• Post between 9am–12pm on weekdays`;
}

function generateSocialBlast(config: ReturnType<typeof loadGrowthConfig>): string {
  if (!config) return '';
  const keywords = config.intent_keywords ?? [];
  const hook = keywords[0] ? `Tired of "${keywords[0]}"?` : `Solving [problem] differently.`;

  return `${hook}

I built ${config.app} to [solve this specific problem].

[One sentence on what makes it different — no adjectives, just what it does]

${config.url}`;
}

function generateTelegramPost(config: ReturnType<typeof loadGrowthConfig>): string {
  if (!config) return '';
  return `*${config.app}*

[Specific data point or insight relevant to this channel's audience]

Built this to solve [problem the channel cares about].

${config.url}`;
}

function generateDevtoArticle(config: ReturnType<typeof loadGrowthConfig>): string {
  if (!config) return '';
  const questions = config.aeo_target_questions ?? [];

  return `---
title: I built ${config.app} to solve [problem] — here's what I learned
published: false
tags: [fill in 4 relevant tags]
canonical_url: ${config.url}
---

[This article should genuinely document your building experience. 
AI engines and search engines cite articles with specific technical details.
Do NOT write marketing content — write a real engineering/product post.]

## The problem

[Describe the exact problem in first-person, specific terms. 
What were you doing? What didn't exist? What did you try first?]

## What I built

[Technical description of the solution. Be specific: stack, key decisions, tradeoffs.]

## The interesting part

[What was technically interesting or surprising? This is what gets shared.]

## What I learned

[Honest lessons — including what didn't work. Authenticity drives engagement.]

## Try it

${config.url}

---
Questions people ask about this problem that led me here:
${questions.map(q => `- ${q}`).join('\n')}
`;
}

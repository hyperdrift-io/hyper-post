import { GrowthConfig } from '../growth-config';

const DIRECTORY_URLS: Record<string, string> = {
  'Product Hunt': 'https://www.producthunt.com/posts/new',
  'G2': 'https://www.g2.com/products/new',
  'Capterra': 'https://www.capterra.com/vendors/new',
  'AlternativeTo': 'https://alternativeto.net/software/submit/',
  'BetaList': 'https://betalist.com/submit',
  'SaaSHub': 'https://www.saashub.com/submit',
  'Indie Hackers': 'https://www.indiehackers.com/post/new',
  'Hacker News (Show HN)': 'https://news.ycombinator.com/submit',
  'StackShare': 'https://stackshare.io/submit-tool',
  'StartupStash': 'https://startupstash.com/submit/',
  'Crunchbase': 'https://www.crunchbase.com/add-new',
  'There\'s An AI For That': 'https://theresanaiforthat.com/submit/',
  'Futurepedia': 'https://www.futurepedia.io/submit-tool',
  'AppSumo Marketplace': 'https://appsumo.com/partners/',
  'MicroLaunch': 'https://microlaunch.net/submit',
  'Betapage': 'https://betapage.co/startup/submit',
  'DeFi Llama ecosystem listing': 'https://github.com/DefiLlama/DefiLlama-Adapters',
  'CryptoSlate (submit as tool)': 'https://cryptoslate.com/submit-press-release/',
  'dev.to (article)': 'https://dev.to/new',
};

export interface DirectoryChecklist {
  tier1: Array<{ name: string; url: string }>;
  tier2: Array<{ name: string; url: string }>;
  description: string;
  tags: string[];
}

/** Generate a prioritised directory submission checklist for manual completion */
export function generateDirectoryChecklist(config: GrowthConfig): DirectoryChecklist {
  const resolve = (names: string[]) =>
    names.map(name => ({ name, url: DIRECTORY_URLS[name] ?? `https://www.google.com/search?q=${encodeURIComponent(name + ' submit')}` }));

  const tier1 = resolve(config.directories_tier1 ?? [
    'Product Hunt', 'BetaList', 'Hacker News (Show HN)', 'AlternativeTo',
  ]);

  const tier2 = resolve(config.directories_tier2 ?? [
    'Indie Hackers', 'SaaSHub', 'StartupStash',
  ]);

  // Generate a reusable description for all submissions
  const description = `${config.app} — ${config.url}

[Write 2-3 sentences here describing what the app does, who it's for, and what makes it different. 
Use this same description across all directory submissions for consistency.]

Tagline: [one sentence, no exclamation marks]`;

  const tags = config.aeo_target_questions
    ? config.aeo_target_questions
        .join(' ')
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g)
        ?.filter((w, i, arr) => arr.indexOf(w) === i)
        .slice(0, 8) ?? []
    : [];

  return { tier1, tier2, description, tags };
}

/** Print the checklist to stdout in a human-friendly format */
export function printDirectoryChecklist(checklist: DirectoryChecklist, appName: string): void {
  console.log('\n━━━ Directory Submission Checklist ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`App: ${appName}`);
  console.log('\nReusable description for all submissions:');
  console.log('─'.repeat(60));
  console.log(checklist.description);
  if (checklist.tags.length > 0) {
    console.log(`\nSuggested tags: ${checklist.tags.join(', ')}`);
  }
  console.log('─'.repeat(60));
  console.log('\nTier 1 — submit first (highest DA / most relevant traffic):');
  for (const dir of checklist.tier1) {
    console.log(`  [ ] ${dir.name.padEnd(35)} ${dir.url}`);
  }
  console.log('\nTier 2 — submit after Tier 1 is done:');
  for (const dir of checklist.tier2) {
    console.log(`  [ ] ${dir.name.padEnd(35)} ${dir.url}`);
  }
  console.log('\nTime estimate: ~3-4 hours total. Do Tier 1 on launch day.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

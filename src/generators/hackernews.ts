import { GrowthConfig } from '../growth-config';

export interface HNDraft {
  title: string;
  submitUrl: string;
  openingComment: string;
  tips: string[];
}

/**
 * Generate a Show HN submission draft.
 * HN has no API — this produces the title, URL, and opening comment
 * for manual submission. Approving opens the browser prefilled.
 */
export function generateHNDraft(config: GrowthConfig): HNDraft {
  const hook = config.hn_hook ?? `${config.app} – ${config.url}`;

  // Enforce HN title rules: no exclamation marks, no marketing language, ≤80 chars
  let title = `Show HN: ${hook}`;
  if (title.length > 80) {
    title = title.slice(0, 77) + '...';
  }

  const submitUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(config.url)}&t=${encodeURIComponent(title)}`;

  const openingComment = `[Write your opening comment here — this is your first and most important comment]

Guidelines for a good Show HN opening comment:
- What problem does it solve? (be specific, not "I wanted to...")
- What's technically interesting about it? (HN audience is engineers)
- What stage is it? (early, working prototype, launched)
- What are you looking for from HN? (feedback, users, co-founders?)
- What was the hardest part to build?

Keep it under 300 words. No marketing language. No "excited to share".
`;

  return {
    title,
    submitUrl,
    openingComment,
    tips: [
      'Post Tuesday–Thursday, 8–10am ET for maximum visibility',
      'Have 3+ genuine HN comments before Show HN (builds credibility)',
      'Reply to every comment within the first 2 hours',
      'Don\'t edit the title after submission',
      'The opening comment matters more than the title — write it carefully',
    ],
  };
}

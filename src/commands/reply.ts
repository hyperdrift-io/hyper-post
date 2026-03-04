import { prisma } from '../database';
import { HyperPost } from '../HyperPost';
import { loadCredentials } from '../cli-utils';

export interface ReplyListOptions {
  app?: string;
  minScore?: number;
  status?: string;
}

/** Display pending reply drafts with their signal context */
export async function listDrafts(options: ReplyListOptions = {}): Promise<void> {
  const where: Record<string, unknown> = { status: options.status ?? 'draft' };
  if (options.app) where.appName = options.app;

  const drafts = await prisma.draft.findMany({
    where,
    include: { signal: true },
    orderBy: [
      { signal: { intentScore: 'desc' } },
      { createdAt: 'desc' },
    ],
  });

  if (drafts.length === 0) {
    console.log('No drafts found. Run `hyper-post listen <app>` to fetch new signals.');
    return;
  }

  console.log(`\n${drafts.length} draft(s):\n`);

  for (const draft of drafts) {
    const score = draft.signal?.intentScore ?? '—';
    const platform = draft.platform.padEnd(10);
    const app = draft.appName.padEnd(15);
    console.log(`  [${draft.id.slice(-6)}] ${platform} ${app} score:${score}`);
    if (draft.signal) {
      console.log(`           Thread: ${draft.signal.title.slice(0, 65)}`);
      console.log(`           URL:    ${draft.signal.url}`);
    }
    console.log(`           Status: ${draft.status}`);
    console.log('');
  }

  console.log('Commands:');
  console.log('  hyper-post reply approve <id>   — mark as approved');
  console.log('  hyper-post reply view <id>      — show full draft content');
  console.log('  hyper-post reply post <id>      — post approved draft');
  console.log('  hyper-post reply ignore <id>    — ignore this signal');
}

/** Show the full content of a draft */
export async function viewDraft(draftId: string): Promise<void> {
  const draft = await prisma.draft.findFirst({
    where: { id: { endsWith: draftId } },
    include: { signal: true },
  });

  if (!draft) {
    console.error(`Draft not found: ${draftId}`);
    process.exit(1);
  }

  console.log(`\nDraft [${draft.id.slice(-6)}]`);
  console.log(`Platform: ${draft.platform} | App: ${draft.appName} | Status: ${draft.status}`);
  if (draft.signal) {
    console.log(`\nThread: ${draft.signal.title}`);
    console.log(`URL: ${draft.signal.url}`);
    console.log(`Intent score: ${draft.signal.intentScore}`);
    console.log(`\nExcerpt:\n${draft.signal.excerpt}`);
  }
  console.log(`\n--- Draft content ---\n`);
  console.log(draft.content);
}

/** Mark a draft as approved */
export async function approveDraft(draftId: string): Promise<void> {
  const draft = await prisma.draft.findFirst({
    where: { id: { endsWith: draftId } },
  });

  if (!draft) {
    console.error(`Draft not found: ${draftId}`);
    process.exit(1);
  }

  await prisma.draft.update({
    where: { id: draft.id },
    data: { status: 'approved' },
  });

  console.log(`Approved draft [${draftId}]`);
  console.log(`Post it: hyper-post reply post ${draftId}`);
}

/** Mark a signal/draft as ignored */
export async function ignoreDraft(draftId: string): Promise<void> {
  const draft = await prisma.draft.findFirst({
    where: { id: { endsWith: draftId } },
  });

  if (!draft) {
    console.error(`Draft not found: ${draftId}`);
    process.exit(1);
  }

  await prisma.draft.update({
    where: { id: draft.id },
    data: { status: 'ignored' },
  });

  if (draft.signalId) {
    await prisma.intentSignal.update({
      where: { id: draft.signalId },
      data: { status: 'ignored' },
    });
  }

  console.log(`Ignored draft [${draftId}]`);
}

/** Post an approved draft to its platform */
export async function postDraft(draftId: string): Promise<void> {
  const draft = await prisma.draft.findFirst({
    where: { id: { endsWith: draftId } },
  });

  if (!draft) {
    console.error(`Draft not found: ${draftId}`);
    process.exit(1);
  }

  if (draft.status !== 'approved') {
    console.error(`Draft must be approved before posting. Run: hyper-post reply approve ${draftId}`);
    process.exit(1);
  }

  const metadata = JSON.parse(draft.metadata || '{}');

  // Handle HN — no API, open browser
  if (draft.platform === 'hackernews') {
    const hnUrl = metadata.submitUrl;
    if (hnUrl) {
      console.log(`Opening HN submission in browser: ${hnUrl}`);
      const { exec } = await import('child_process');
      exec(`open "${hnUrl}"`);
      await prisma.draft.update({ where: { id: draft.id }, data: { status: 'posted', postedAt: new Date() } });
    }
    return;
  }

  // Post via hyper-post platform
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    const result = await hyperPost.postToPlatforms([draft.platform as never], {
      content: draft.content,
      url: metadata.url,
      title: metadata.title,
      tags: metadata.tags,
    });

    if (result.successful > 0) {
      await prisma.draft.update({
        where: { id: draft.id },
        data: { status: 'posted', postedAt: new Date() },
      });
      if (draft.signalId) {
        await prisma.intentSignal.update({
          where: { id: draft.signalId },
          data: { status: 'replied' },
        });
      }
      console.log(`Posted draft [${draftId}] to ${draft.platform}`);
    } else {
      const err = result.results[0]?.error ?? 'Unknown error';
      console.error(`Failed to post: ${err}`);
    }
  } catch (err) {
    console.error(`Error posting: ${(err as Error).message}`);
    process.exit(1);
  }
}

/** Post all approved drafts for an app */
export async function postAllApproved(appName: string): Promise<void> {
  const drafts = await prisma.draft.findMany({
    where: { appName, status: 'approved' },
  });

  if (drafts.length === 0) {
    console.log(`No approved drafts for ${appName}.`);
    return;
  }

  console.log(`Posting ${drafts.length} approved draft(s) for ${appName}...`);
  for (const draft of drafts) {
    await postDraft(draft.id.slice(-6));
  }
}

/**
 * The Daily Byte — newspaper-fetch skill
 *
 * Can be run:
 * - As an OpenClaw scheduled skill (cron: '0 7 * * *' UTC)
 * - Standalone: `tsx skill.ts` (requires ANTHROPIC_API_KEY)
 * - Force re-run: `tsx skill.ts --force`
 */

import { resolveAI } from './lib/ai.js'
import { todayEditionDate } from './lib/date.js'
import { deduplicateItems } from './lib/dedup.js'
import { fetchGitHub } from './lib/fetchers/github.js'
import { fetchHN } from './lib/fetchers/hn.js'
import { fetchReddit } from './lib/fetchers/reddit.js'
import { process as scoreItems } from './lib/process.js'
import { store } from './lib/store.js'

const SUBREDDITS = ['programming', 'MachineLearning', 'webdev', 'devops']

async function run(opts: { force?: boolean } = {}): Promise<void> {
  const date = todayEditionDate()
  console.log(`[newspaper-fetch] Running for edition: ${date}${opts.force ? ' (force)' : ''}`)

  // Fetch all sources in parallel, fail independently
  const [hnResult, redditResult, githubResult] = await Promise.allSettled([
    fetchHN(),
    fetchReddit(SUBREDDITS),
    fetchGitHub(),
  ])

  const hn = hnResult.status === 'fulfilled' ? hnResult.value : []
  const reddit = redditResult.status === 'fulfilled' ? redditResult.value : []
  const github = githubResult.status === 'fulfilled' ? githubResult.value : []

  if (hnResult.status === 'rejected') {
    console.warn('[newspaper-fetch] HN fetch failed:', hnResult.reason)
  }
  if (redditResult.status === 'rejected') {
    console.warn('[newspaper-fetch] Reddit fetch failed:', redditResult.reason)
  }
  if (githubResult.status === 'rejected') {
    console.warn('[newspaper-fetch] GitHub fetch failed:', githubResult.reason)
  }

  const raw = [...hn, ...reddit, ...github]
  if (raw.length === 0) {
    throw new Error('[newspaper-fetch] All sources failed — skipping edition')
  }

  console.log(`[newspaper-fetch] Fetched: HN=${hn.length}, Reddit=${reddit.length}, GitHub=${github.length}`)

  // Deduplicate by URL
  const items = deduplicateItems(raw)
  console.log(`[newspaper-fetch] After dedup: ${items.length} items (removed ${raw.length - items.length})`)

  if (items.length === 0) {
    throw new Error('[newspaper-fetch] No items after deduplication — skipping edition')
  }

  // Score and rewrite with AI
  const ai = await resolveAI()
  console.log('[newspaper-fetch] Calling AI for scoring...')
  const scored = await scoreItems(items, ai)
  console.log('[newspaper-fetch] AI scoring complete')

  // Store edition, rebuild feed, send channel delivery
  await store(scored, date, opts)
}

// OpenClaw skill export
export default {
  schedule: '0 7 * * *',
  run,
}

// Standalone execution
const isMain = process.argv[1]?.endsWith('skill.ts') || process.argv[1]?.endsWith('skill.js')
if (isMain) {
  const force = process.argv.includes('--force')
  run({ force }).catch(err => {
    console.error('[newspaper-fetch] Fatal error:', err)
    process.exit(1)
  })
}

/**
 * The Daily Byte — newspaper-fetch skill
 */

import { resolveAI } from './lib/ai.js'
import { loadConfig } from './lib/config.js'
import { todayEditionDate } from './lib/date.js'
import { deduplicateItems } from './lib/dedup.js'
import { fetchClaudeSkills } from './lib/fetchers/claude-skills.js'
import { fetchGitHub } from './lib/fetchers/github.js'
import { fetchHN } from './lib/fetchers/hn.js'
import { fetchReddit } from './lib/fetchers/reddit.js'
import { fetchSkills } from './lib/fetchers/skills.js'
import { process as scoreItems } from './lib/process.js'
import { store } from './lib/store.js'

async function run(opts: { force?: boolean } = {}): Promise<void> {
  const date = todayEditionDate()
  const config = loadConfig()
  console.log(`[newspaper-fetch] Running for edition: ${date}${opts.force ? ' (force)' : ''}`)

  const enabledSources = {
    hn: config.sources.hackernews.enabled,
    reddit: config.sources.reddit.enabled,
    github: config.sources.github.enabled,
    skills: config.sources.skills.enabled,
  }

  const fetchTasks = [
    enabledSources.hn ? fetchHN() : Promise.resolve([]),
    enabledSources.reddit ? fetchReddit(config.sources.reddit.subreddits) : Promise.resolve([]),
    enabledSources.github ? fetchGitHub() : Promise.resolve([]),
    enabledSources.skills
      ? Promise.all([
          fetchSkills(config.sources.skills.topN, config.sources.skills.detailFetchLimit),
          fetchClaudeSkills(config.sources.skills.claudeSkillsTopN),
        ]).then(([primary, secondary]) => [...primary, ...secondary])
      : Promise.resolve([]),
  ]

  const [hnResult, redditResult, githubResult, skillsResult] = await Promise.allSettled(fetchTasks)

  const hn = hnResult.status === 'fulfilled' ? hnResult.value : []
  const reddit = redditResult.status === 'fulfilled' ? redditResult.value : []
  const github = githubResult.status === 'fulfilled' ? githubResult.value : []
  const skills = skillsResult.status === 'fulfilled' ? skillsResult.value : []

  if (enabledSources.hn && hnResult.status === 'rejected') console.warn('[newspaper-fetch] HN fetch failed:', hnResult.reason)
  if (enabledSources.reddit && redditResult.status === 'rejected') console.warn('[newspaper-fetch] Reddit fetch failed:', redditResult.reason)
  if (enabledSources.github && githubResult.status === 'rejected') console.warn('[newspaper-fetch] GitHub fetch failed:', githubResult.reason)
  if (enabledSources.skills && skillsResult.status === 'rejected') console.warn('[newspaper-fetch] Skills fetch failed:', skillsResult.reason)

  const raw = [...hn, ...reddit, ...github, ...skills]
  if (raw.length === 0) {
    throw new Error('[newspaper-fetch] All enabled sources failed — skipping edition')
  }

  console.log(`[newspaper-fetch] Fetched: HN=${hn.length}, Reddit=${reddit.length}, GitHub=${github.length}, Skills=${skills.length}`)

  const items = deduplicateItems(raw)
  console.log(`[newspaper-fetch] After dedup: ${items.length} items (removed ${raw.length - items.length})`)

  if (items.length === 0) {
    throw new Error('[newspaper-fetch] No items after deduplication — skipping edition')
  }

  const ai = await resolveAI()
  console.log('[newspaper-fetch] Calling AI for scoring...')
  const scored = await scoreItems(items, ai)
  console.log('[newspaper-fetch] AI scoring complete')

  await store(scored, date, opts)
}

export default {
  schedule: '0 7 * * *',
  run,
}

const isMain = process.argv[1]?.endsWith('skill.ts') || process.argv[1]?.endsWith('skill.js')
if (isMain) {
  const force = process.argv.includes('--force')
  run({ force }).catch(err => {
    console.error('[newspaper-fetch] Fatal error:', err)
    process.exit(1)
  })
}

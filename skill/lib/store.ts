import fs from 'fs'
import path from 'path'
import type { Edition, RunLogEntry, ScoredItem } from './types.js'
import { isComplete, loadManifest, updateManifest } from './manifest.js'
import { appendRunLog } from './runlog.js'
import { rebuildFeed } from './feed.js'

function resolveEditionsDir(): string {
  return (
    process.env.NEWSPAPER_DATA_DIR ??
    path.resolve(process.cwd(), '..', 'data', 'editions')
  )
}

function buildEdition(scored: ScoredItem[], date: string, editionsDir: string): Edition {
  const existing = fs.readdirSync(editionsDir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  const editionNumber = existing.length + 1

  const nonSkills = scored.filter(i => i.source !== 'skills')
  const sorted = [...nonSkills].sort((a, b) => b.ai_score - a.ai_score)
  const frontPage = sorted.slice(0, 5)

  const hn = scored.filter(i => i.source === 'hackernews')
  const reddit = scored.filter(i => i.source === 'reddit')
  const github = scored.filter(i => i.source === 'github')
  const skills = scored
    .filter(i => i.source === 'skills')
    .sort((a, b) => (a.skill_rank ?? 9999) - (b.skill_rank ?? 9999) || b.ai_score - a.ai_score)

  return {
    schema_version: 1,
    date,
    edition: editionNumber,
    generated_at: new Date().toISOString(),
    front_page: frontPage,
    sections: { hackernews: hn, reddit, github, skills },
  }
}

async function sendChannelDelivery(top3: ScoredItem[], date: string): Promise<void> {
  try {
    const { openclaw } = await import('@openclaw/sdk' as string) as {
      openclaw: { channels?: { default?: { send: (msg: string) => Promise<void> } } }
    }
    if (!openclaw.channels?.default?.send) {
      console.warn('[store] openclaw.channels.default.send not available — skipping delivery')
      return
    }
    const message =
      `📰 *THE DAILY BYTE — ${date}*\n\n` +
      top3.map((item, i) => `${i + 1}. ${item.retro_headline}`).join('\n')
    await openclaw.channels.default.send(message)
  } catch {
    console.warn('[store] Channel delivery unavailable (standalone mode) — skipping')
  }
}

function loadAllEditions(editionsDir: string): Edition[] {
  return fs
    .readdirSync(editionsDir)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(editionsDir, f), 'utf-8')) as Edition
      } catch {
        return null
      }
    })
    .filter((e): e is Edition => e !== null)
}

export async function store(scored: ScoredItem[], date: string, opts: { force?: boolean } = {}): Promise<void> {
  const editionsDir = resolveEditionsDir()
  fs.mkdirSync(editionsDir, { recursive: true })

  const startedAt = new Date().toISOString()
  const startMs = Date.now()
  const manifest = loadManifest(editionsDir, date)
  if (isComplete(manifest) && !opts.force) {
    console.log(`[store] Edition ${date} already complete — skipping (use --force to override)`)
    return
  }

  const hnCount = scored.filter(i => i.source === 'hackernews').length
  const redditCount = scored.filter(i => i.source === 'reddit').length
  const githubCount = scored.filter(i => i.source === 'github').length
  const skillsCount = scored.filter(i => i.source === 'skills').length

  let status: RunLogEntry['status'] = 'ok'
  let errorMsg: string | undefined

  if (!manifest?.json_written || opts.force) {
    const edition = buildEdition(scored, date, editionsDir)
    const jsonPath = path.join(editionsDir, `${date}.json`)
    const tmpPath = `${jsonPath}.tmp`
    fs.writeFileSync(tmpPath, JSON.stringify(edition, null, 2))
    fs.renameSync(tmpPath, jsonPath)
    console.log(`[store] Written ${jsonPath}`)
    updateManifest(editionsDir, date, { json_written: true })
  }

  if (!manifest?.feed_updated || opts.force) {
    try {
      const allEditions = loadAllEditions(editionsDir)
      rebuildFeed(editionsDir, allEditions)
      console.log('[store] feed.xml updated')
      updateManifest(editionsDir, date, { feed_updated: true })
    } catch (err) {
      console.error('[store] feed.xml rebuild failed:', err)
      status = 'partial'
      errorMsg = String(err)
    }
  }

  if (!manifest?.channel_sent || opts.force) {
    const top3 = [...scored].filter(i => i.source !== 'skills').sort((a, b) => b.ai_score - a.ai_score).slice(0, 3)
    await sendChannelDelivery(top3, date)
    updateManifest(editionsDir, date, { channel_sent: true })
  }

  const durationMs = Date.now() - startMs
  appendRunLog(editionsDir, {
    date,
    started_at: startedAt,
    duration_ms: durationMs,
    hn_count: hnCount,
    reddit_count: redditCount,
    github_count: githubCount,
    skills_count: skillsCount,
    total_before_dedup: scored.length,
    total_after_dedup: scored.length,
    status,
    error: errorMsg,
  })

  console.log(`[store] Done in ${durationMs}ms`)
}

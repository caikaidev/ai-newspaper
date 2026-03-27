import type { RawItem } from '../types.js'

const URL = 'https://claudeskills.club/leaderboard'
const USER_AGENT = 'TheDailyByte/1.0 (github.com/caikaidev/ai-newspaper)'

function parseInstallCount(raw: string): number | undefined {
  const text = raw.trim().replace(/,/g, '').toUpperCase()
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)([KM]?)/)
  if (!match) return undefined
  const value = Number(match[1])
  const suffix = match[2]
  if (suffix === 'M') return Math.round(value * 1_000_000)
  if (suffix === 'K') return Math.round(value * 1_000)
  return Math.round(value)
}

export async function fetchClaudeSkills(topN = 6): Promise<RawItem[]> {
  const res = await fetch(URL, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
  })

  if (!res.ok) {
    throw new Error(`claudeskills.club fetch error: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n+/g, '\n')

  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const items: RawItem[] = []
  for (let i = 0; i < lines.length - 3; i++) {
    const rank = Number(lines[i])
    const title = lines[i + 1]
    const owner = lines[i + 2]
    const installsRaw = lines[i + 3]

    if (!Number.isInteger(rank) || rank <= 0 || rank > 1000) continue
    if (!owner.includes('/')) continue
    if (!/^[0-9.]+[KM]?$/i.test(installsRaw)) continue

    const slug = `${owner.split('/')[0]}-${title}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    items.push({
      id: `claude-skills-${owner.replace(/\//g, '-')}-${title}`,
      source: 'skills',
      title,
      url: `https://claudeskills.club/skills/${slug}`,
      owner,
      installs: parseInstallCount(installsRaw),
      skill_rank: rank,
      source_label: 'claudeskills.club',
      summary: 'Top-ranked skill from the Claude Skills leaderboard, surfaced for current community adoption.',
    })

    if (items.length >= topN) break
  }

  return items
}

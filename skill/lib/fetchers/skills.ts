import * as cheerio from 'cheerio'
import type { RawItem } from '../types.js'

const SKILLS_URL = 'https://skills.sh/'
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

async function fetchSkillSummary(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return undefined
    const html = await res.text()
    const $ = cheerio.load(html)

    const metaDescription = $('meta[name="description"]').attr('content')?.trim()
    const firstParagraph = $('main p').first().text().trim()
    const firstHeadingParagraph = $('article p').first().text().trim()

    const candidates = [firstHeadingParagraph, firstParagraph, metaDescription].filter(Boolean)
    return candidates.find(Boolean)
  } catch {
    return undefined
  }
}

export async function fetchSkills(topN = 9, detailFetchLimit = 6): Promise<RawItem[]> {
  const res = await fetch(SKILLS_URL, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
  })

  if (!res.ok) {
    throw new Error(`skills.sh fetch error: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const rows = $('a[href*="/skills/"]')
  const seen = new Set<string>()
  const items: RawItem[] = []

  rows.each((_i, el) => {
    const href = $(el).attr('href')?.trim()
    if (!href || !href.includes('/skills/')) return

    const pathParts = href.replace(/^\//, '').split('/')
    if (pathParts.length < 3) return

    const owner = `${pathParts[0]}/${pathParts[1]}`
    const slug = pathParts[2]
    if (!slug || seen.has(slug)) return
    seen.add(slug)

    const rankText = $(el).find('span').first().text().trim()
    const rank = parseInt(rankText) || undefined
    const title = $(el).find('h3').first().text().trim() || slug
    const ownerText = $(el).find('p').first().text().trim() || owner
    const installsText = $(el).find('span').last().text().trim()
    const installs = parseInstallCount(installsText)

    items.push({
      id: `skills-${owner.replace(/\//g, '-')}-${slug}`,
      source: 'skills',
      title,
      url: `https://skills.sh${href.startsWith('/') ? href : `/${href}`}`,
      owner: ownerText,
      installs,
      skill_rank: rank,
      source_label: 'skills.sh',
    })
  })

  const trimmed = items
    .filter(item => typeof item.skill_rank === 'number')
    .sort((a, b) => (a.skill_rank ?? 9999) - (b.skill_rank ?? 9999))
    .slice(0, topN)

  const summaries = await Promise.all(
    trimmed.map((item, index) => index < detailFetchLimit ? fetchSkillSummary(item.url) : Promise.resolve(undefined))
  )

  return trimmed.map((item, index) => ({
    ...item,
    summary: summaries[index],
  }))
}

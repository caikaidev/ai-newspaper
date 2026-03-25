import * as cheerio from 'cheerio'
import type { RawItem } from '../types.js'

const GITHUB_TRENDING_URL = 'https://github.com/trending'
const SELECTOR = 'article.Box-row'

export async function fetchGitHub(): Promise<RawItem[]> {
  const res = await fetch(GITHUB_TRENDING_URL, {
    headers: {
      'User-Agent': 'TheDailyByte/1.0 (github.com/daily-byte/newspaper)',
      Accept: 'text/html',
    },
  })

  if (!res.ok) {
    throw new Error(`GitHub Trending fetch error: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const rows = $(SELECTOR)

  if (rows.length === 0) {
    console.warn(
      '[github] Trending selector may be stale — article.Box-row returned 0 results. ' +
      'Check https://github.com/trending manually.'
    )
    return []
  }

  const items: RawItem[] = []

  rows.slice(0, 20).each((_i, el) => {
    const repoAnchor = $(el).find('h2 a').first()
    const repoPath = repoAnchor.attr('href')?.replace(/^\//, '') ?? ''
    const title =
      $(el).find('p').first().text().trim() ||
      repoPath.replace('/', ' / ')
    const starsText = $(el)
      .find('[aria-label="star"]')
      .parent()
      .text()
      .trim()
      .replace(/,/g, '')
    const stars = parseInt(starsText) || undefined

    if (!repoPath) return

    items.push({
      id: `github-${repoPath.replace('/', '-')}`,
      source: 'github' as const,
      title,
      url: `https://github.com/${repoPath}`,
      repo: repoPath,
      stars,
    })
  })

  return items
}

import * as cheerio from 'cheerio'
import type { RawItem } from '../types.js'

const USER_AGENT = 'TheDailyByte/1.0 (github.com/daily-byte/newspaper)'
const DELAY_BETWEEN_SUBS_MS = 500
const MAX_RETRIES = 3

interface RedditPost {
  data: {
    id: string
    title: string
    url: string
    score: number
    num_comments: number
    subreddit: string
  }
}

interface RedditResponse {
  data: { children: RedditPost[] }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeRedditUrl(url?: string): string {
  if (!url) return 'https://www.reddit.com'
  if (url.startsWith('/')) return `https://www.reddit.com${url}`
  return url
}

export function parseRedditRss(xml: string, subreddit: string): RawItem[] {
  const $ = cheerio.load(xml, { xmlMode: true })
  const seen = new Set<string>()
  const items: RawItem[] = []

  $('entry').each((_i, el) => {
    const id = $(el).find('id').first().text().trim()
    const title = $(el).find('title').first().text().trim()
    const link =
      $(el).find('link').first().attr('href') ??
      $(el).find('content').first().attr('src') ??
      ''

    if (!id || !title || !link || seen.has(id)) return
    seen.add(id)

    items.push({
      id: `reddit-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      source: 'reddit',
      title,
      url: normalizeRedditUrl(link),
      subreddit,
    })
  })

  return items.slice(0, 20)
}

async function fetchSubredditJson(subreddit: string, attempt = 0): Promise<RawItem[]> {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=20`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (res.status === 429) {
    if (attempt >= MAX_RETRIES) {
      console.warn(`[reddit] r/${subreddit} rate limited after ${MAX_RETRIES} retries — skipping JSON endpoint`)
      return []
    }
    const retryAfter = res.headers.get('Retry-After')
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt + 1) * 1000
    console.warn(`[reddit] r/${subreddit} rate limited — retrying JSON in ${delay}ms`)
    await sleep(delay)
    return fetchSubredditJson(subreddit, attempt + 1)
  }

  if (res.status === 403) {
    throw new Error(`Reddit JSON blocked for r/${subreddit}: 403`)
  }

  if (!res.ok) {
    throw new Error(`Reddit API error for r/${subreddit}: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as RedditResponse

  return data.data.children.slice(0, 20).map(post => ({
    id: `reddit-${post.data.id}`,
    source: 'reddit' as const,
    title: post.data.title,
    url: normalizeRedditUrl(post.data.url),
    points: post.data.score,
    comments: post.data.num_comments,
    subreddit: post.data.subreddit,
  }))
}

async function fetchSubredditRss(subreddit: string): Promise<RawItem[]> {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot/.rss?limit=20`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8' },
  })

  if (!res.ok) {
    throw new Error(`Reddit RSS error for r/${subreddit}: ${res.status} ${res.statusText}`)
  }

  const xml = await res.text()
  return parseRedditRss(xml, subreddit)
}

async function fetchSubreddit(subreddit: string): Promise<RawItem[]> {
  try {
    return await fetchSubredditJson(subreddit)
  } catch (err) {
    console.warn(`[reddit] r/${subreddit} JSON fetch failed — falling back to RSS:`, err)
    return fetchSubredditRss(subreddit)
  }
}

export async function fetchReddit(subreddits: string[]): Promise<RawItem[]> {
  const results: RawItem[] = []

  for (const [i, sub] of subreddits.entries()) {
    if (i > 0) await sleep(DELAY_BETWEEN_SUBS_MS)
    try {
      const items = await fetchSubreddit(sub)
      results.push(...items)
    } catch (err) {
      console.warn(`[reddit] r/${sub} fetch failed:`, err)
    }
  }

  return results
}

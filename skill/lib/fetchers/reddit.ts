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

async function fetchSubreddit(subreddit: string, attempt = 0): Promise<RawItem[]> {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=20`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (res.status === 429) {
    if (attempt >= MAX_RETRIES) {
      console.warn(`[reddit] r/${subreddit} rate limited after ${MAX_RETRIES} retries — skipping`)
      return []
    }
    const retryAfter = res.headers.get('Retry-After')
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt + 1) * 1000
    console.warn(`[reddit] r/${subreddit} rate limited — retrying in ${delay}ms`)
    await sleep(delay)
    return fetchSubreddit(subreddit, attempt + 1)
  }

  if (!res.ok) {
    throw new Error(`Reddit API error for r/${subreddit}: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as RedditResponse

  return data.data.children.slice(0, 20).map(post => ({
    id: `reddit-${post.data.id}`,
    source: 'reddit' as const,
    title: post.data.title,
    url: post.data.url,
    points: post.data.score,
    comments: post.data.num_comments,
    subreddit: post.data.subreddit,
  }))
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

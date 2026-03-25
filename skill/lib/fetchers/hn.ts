import type { RawItem } from '../types.js'

const ALGOLIA_URL =
  'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20'

interface AlgoliaHit {
  objectID: string
  title: string
  url?: string
  points: number
  num_comments: number
}

interface AlgoliaResponse {
  hits: AlgoliaHit[]
}

export async function fetchHN(): Promise<RawItem[]> {
  const res = await fetch(ALGOLIA_URL, {
    headers: { 'User-Agent': 'TheDailyByte/1.0 (github.com/daily-byte/newspaper)' },
  })

  if (!res.ok) {
    throw new Error(`HN Algolia API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as AlgoliaResponse
  const seen = new Set<string>()

  return data.hits
    .filter(hit => {
      if (seen.has(hit.objectID)) return false
      seen.add(hit.objectID)
      return true
    })
    .slice(0, 20)
    .map(hit => ({
      id: `hn-${hit.objectID}`,
      source: 'hackernews' as const,
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      comments: hit.num_comments,
    }))
}

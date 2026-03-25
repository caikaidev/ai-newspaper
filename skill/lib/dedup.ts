import type { RawItem } from './types.js'

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref']

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    UTM_PARAMS.forEach(p => u.searchParams.delete(p))
    return u.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}

/** Remove duplicate items by normalized URL, keeping highest-engagement version. */
export function deduplicateItems(items: RawItem[]): RawItem[] {
  const seen = new Map<string, RawItem>()

  for (const item of items) {
    const key = normalizeUrl(item.url)
    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, item)
    } else {
      const score = (item.points ?? 0) + (item.comments ?? 0)
      const existingScore = (existing.points ?? 0) + (existing.comments ?? 0)
      if (score > existingScore) {
        seen.set(key, item)
      }
    }
  }

  return Array.from(seen.values())
}

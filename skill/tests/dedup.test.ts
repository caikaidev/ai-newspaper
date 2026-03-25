import { describe, it, expect } from 'vitest'
import { deduplicateItems } from '../lib/dedup.js'
import type { RawItem } from '../lib/types.js'

function item(overrides: Partial<RawItem> & { id: string; url: string }): RawItem {
  return {
    source: 'hackernews',
    title: 'Test title',
    points: 100,
    comments: 10,
    ...overrides,
  }
}

describe('deduplicateItems', () => {
  it('returns empty array for empty input', () => {
    expect(deduplicateItems([])).toEqual([])
  })

  it('returns all items when all unique', () => {
    const items = [
      item({ id: '1', url: 'https://example.com/a' }),
      item({ id: '2', url: 'https://example.com/b' }),
      item({ id: '3', url: 'https://example.com/c' }),
    ]
    expect(deduplicateItems(items)).toHaveLength(3)
  })

  it('removes duplicate URL keeping higher engagement', () => {
    const low = item({ id: '1', url: 'https://example.com/story', points: 50, comments: 5 })
    const high = item({ id: '2', url: 'https://example.com/story', points: 800, comments: 300, source: 'reddit' })
    const result = deduplicateItems([low, high])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('strips UTM params when deduplicating', () => {
    const a = item({ id: '1', url: 'https://example.com/story?utm_source=hn&utm_medium=post', points: 200 })
    const b = item({ id: '2', url: 'https://example.com/story', points: 100 })
    const result = deduplicateItems([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1') // higher engagement
  })

  it('treats trailing slash as duplicate', () => {
    const a = item({ id: '1', url: 'https://example.com/story/', points: 50 })
    const b = item({ id: '2', url: 'https://example.com/story', points: 200 })
    const result = deduplicateItems([a, b])
    expect(result).toHaveLength(1)
  })

  it('treats different paths as distinct', () => {
    const a = item({ id: '1', url: 'https://example.com/a' })
    const b = item({ id: '2', url: 'https://example.com/b' })
    expect(deduplicateItems([a, b])).toHaveLength(2)
  })

  it('handles invalid URL without throwing', () => {
    const a = item({ id: '1', url: 'not-a-valid-url' })
    const b = item({ id: '2', url: 'not-a-valid-url' })
    expect(() => deduplicateItems([a, b])).not.toThrow()
    expect(deduplicateItems([a, b])).toHaveLength(1)
  })
})

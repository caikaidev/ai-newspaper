import { describe, it, expect } from 'vitest'
import { mergeWithScores } from '../lib/process.js'
import type { RawItem } from '../lib/types.js'

function makeItems(count: number): RawItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    source: 'hackernews' as const,
    title: `Test title ${i}`,
    url: `https://example.com/${i}`,
    points: 100,
  }))
}

describe('mergeWithScores', () => {
  it('happy path: correct number of items', () => {
    const items = makeItems(3)
    const aiResponse = JSON.stringify([
      { score: 9.2, retro_headline: 'Headline One', retro_summary: 'Summary one. More detail.', retro_headline_zh: '标题一', retro_summary_zh: '摘要一。更多细节。' },
      { score: 7.5, retro_headline: 'Headline Two', retro_summary: 'Summary two. More detail.', retro_headline_zh: '标题二', retro_summary_zh: '摘要二。更多细节。' },
      { score: 5.0, retro_headline: 'Headline Three', retro_summary: 'Summary three. More detail.', retro_headline_zh: '标题三', retro_summary_zh: '摘要三。更多细节。' },
    ])
    const result = mergeWithScores(items, aiResponse)
    expect(result).toHaveLength(3)
    expect(result[0].ai_score).toBe(9.2)
    expect(result[0].retro_headline).toBe('Headline One')
    expect(result[0].retro_headline_zh).toBe('标题一')
  })

  it('pads missing items with fallback score 5.0', () => {
    const items = makeItems(5)
    const aiResponse = JSON.stringify([
      { score: 8.0, retro_headline: 'H1', retro_summary: 'S1.', retro_headline_zh: '中H1', retro_summary_zh: '中S1。' },
      { score: 7.0, retro_headline: 'H2', retro_summary: 'S2.', retro_headline_zh: '中H2', retro_summary_zh: '中S2。' },
    ])
    const result = mergeWithScores(items, aiResponse)
    expect(result).toHaveLength(5)
    expect(result[2].ai_score).toBe(5.0)
    expect(result[2].retro_headline).toBe(items[2].title)
    expect(result[2].retro_headline_zh).toBe(items[2].title)
    expect(result[3].ai_score).toBe(5.0)
  })

  it('slices extra items returned by AI', () => {
    const items = makeItems(2)
    const aiResponse = JSON.stringify([
      { score: 8.0, retro_headline: 'H1', retro_summary: 'S1.', retro_headline_zh: '中H1', retro_summary_zh: '中S1。' },
      { score: 7.0, retro_headline: 'H2', retro_summary: 'S2.', retro_headline_zh: '中H2', retro_summary_zh: '中S2。' },
      { score: 9.0, retro_headline: 'Extra', retro_summary: 'Extra.', retro_headline_zh: '额外', retro_summary_zh: '额外。' },
    ])
    const result = mergeWithScores(items, aiResponse)
    expect(result).toHaveLength(2)
  })

  it('falls back to original titles when JSON parse fails', () => {
    const items = makeItems(3)
    const result = mergeWithScores(items, 'this is not json at all')
    expect(result).toHaveLength(3)
    expect(result[0].ai_score).toBe(5.0)
    expect(result[0].retro_headline).toBe(items[0].title)
    expect(result[0].retro_headline_zh).toBe(items[0].title)
  })

  it('falls back when AI response fails Zod schema', () => {
    const items = makeItems(2)
    const aiResponse = JSON.stringify([
      { score: 'high', retro_headline: 123, retro_summary: null },
    ])
    const result = mergeWithScores(items, aiResponse)
    expect(result[0].ai_score).toBe(5.0)
  })

  it('preserves original item fields in scored output', () => {
    const items = makeItems(1)
    items[0].points = 847
    items[0].comments = 312
    const aiResponse = JSON.stringify([
      { score: 9.0, retro_headline: 'Headline', retro_summary: 'Summary.', retro_headline_zh: '标题', retro_summary_zh: '摘要。' },
    ])
    const result = mergeWithScores(items, aiResponse)
    expect(result[0].points).toBe(847)
    expect(result[0].comments).toBe(312)
    expect(result[0].source).toBe('hackernews')
    expect(result[0].retro_summary_zh).toBe('摘要。')
  })
})

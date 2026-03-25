import { describe, expect, it, vi } from 'vitest'
import { process as scoreItems } from '../lib/process.js'
import type { AIProvider } from '../lib/ai.js'
import type { RawItem } from '../lib/types.js'

function makeItems(count: number): RawItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    source: 'hackernews' as const,
    title: `Test title ${i}`,
    url: `https://example.com/${i}`,
    points: 100 + i,
    comments: 10 + i,
  }))
}

describe('process batching', () => {
  it('splits large runs into multiple AI calls and preserves ordering', async () => {
    const items = makeItems(45)
    const complete = vi.fn(async (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      const raw = messages[0]?.content ?? ''
      const json = raw.slice(raw.indexOf('Items:\n') + 'Items:\n'.length)
      const parsed = JSON.parse(json) as RawItem[]
      return JSON.stringify(
        parsed.map(item => ({
          score: 7.5,
          retro_headline: `Headline for ${item.id}`,
          retro_summary: `Summary for ${item.id}. Second sentence.`,
        }))
      )
    })

    const ai: AIProvider = { complete }
    const result = await scoreItems(items, ai)

    expect(complete).toHaveBeenCalledTimes(3)
    expect(result).toHaveLength(45)
    expect(result[0].retro_headline).toBe('Headline for item-0')
    expect(result[44].retro_headline).toBe('Headline for item-44')
  })
})

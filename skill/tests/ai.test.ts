import { describe, expect, it } from 'vitest'
import { buildFallbackResponse, extractOpenClawAgentText } from '../lib/ai.js'

describe('extractOpenClawAgentText', () => {
  it('returns the first text payload from openclaw agent JSON', () => {
    const stdout = JSON.stringify({
      status: 'ok',
      result: {
        payloads: [
          { text: 'first response', mediaUrl: null },
          { text: 'second response', mediaUrl: null },
        ],
      },
    })

    expect(extractOpenClawAgentText(stdout)).toBe('first response')
  })
})

describe('buildFallbackResponse', () => {
  it('returns deterministic scored JSON for prompt items', () => {
    const raw = buildFallbackResponse([
      {
        role: 'user',
        content: 'Items:\n' + JSON.stringify([
          { title: 'Story A', source: 'hackernews', points: 120, comments: 35 },
          { title: 'Story B', source: 'github', points: 0, comments: 0 },
        ]),
      },
    ])

    const parsed = JSON.parse(raw) as Array<{ score: number; retro_headline: string; retro_summary: string; retro_headline_zh: string; retro_summary_zh: string }>
    expect(parsed).toHaveLength(2)
    expect(parsed[0].retro_headline).toContain('Story A')
    expect(parsed[0].retro_headline_zh).toContain('Story A')
    expect(parsed[0].score).toBeGreaterThan(0)
    expect(parsed[1].retro_summary).toContain('fallback edition')
    expect(parsed[1].retro_summary_zh).toContain('回退版本')
  })
})

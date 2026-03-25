import type { AIProvider } from './ai.js'
import { AIResponse } from './schemas.js'
import type { RawItem, ScoredItem } from './types.js'

const BATCH_PROMPT_SYSTEM = `You are an editor at a 1920s inter-war era technology newspaper.
Score and rewrite each item below.

For each item, return a JSON object with:
- "score": float 1.0-10.0 (novelty + impact + community interest)
- "retro_headline": headline as 1920s correspondent, max 120 chars, dramatically formal
- "retro_summary": exactly 2 sentences in period journalistic style

Return a JSON ARRAY in the same order as input. Raw JSON only, no markdown.
Validate: array length must equal input length. If unsure on an item, score it 5.0.`

function toFallbackItem(item: RawItem): ScoredItem {
  return {
    ...item,
    ai_score: 5.0,
    retro_headline: item.title,
    retro_summary: '',
  }
}

export function mergeWithScores(items: RawItem[], rawResponse: string): ScoredItem[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    console.warn('[process] AI response not valid JSON — using fallback scores', {
      snippet: rawResponse.slice(0, 200),
    })
    return items.map(toFallbackItem)
  }

  const result = AIResponse.safeParse(parsed)
  if (!result.success) {
    console.warn('[process] AI response failed schema validation — using fallback scores', {
      errors: result.error.issues,
    })
    return items.map(toFallbackItem)
  }

  const scores = result.data.slice(0, items.length) // discard extras

  return items.map((item, i) => ({
    ...item,
    ai_score: scores[i]?.score ?? 5.0,
    retro_headline: scores[i]?.retro_headline ?? item.title,
    retro_summary: scores[i]?.retro_summary ?? '',
  }))
}

export async function process(items: RawItem[], ai: AIProvider): Promise<ScoredItem[]> {
  const inputPayload = items.map(item => ({
    id: item.id,
    title: item.title,
    source: item.source,
    points: item.points,
    comments: item.comments,
  }))

  const userMessage = `Items:\n${JSON.stringify(inputPayload, null, 2)}`

  const rawResponse = await ai.complete([
    { role: 'user', content: `${BATCH_PROMPT_SYSTEM}\n\n${userMessage}` },
  ])

  return mergeWithScores(items, rawResponse)
}

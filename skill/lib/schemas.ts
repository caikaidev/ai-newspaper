import { z } from 'zod'

export const AIResponseItem = z.object({
  score: z.number().min(1).max(10),
  retro_headline: z.string().max(120),
  retro_summary: z.string(),
  retro_headline_zh: z.string().max(120).optional(),
  retro_summary_zh: z.string().optional(),
})

export const AIResponse = z.array(AIResponseItem)

export type AIResponseItemType = z.infer<typeof AIResponseItem>

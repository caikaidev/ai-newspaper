import { z } from 'zod'

export const AIResponseItem = z.object({
  score: z.number().min(1).max(10),
  retro_headline: z.string().max(120),
  retro_summary: z.string(),
})

export const AIResponse = z.array(AIResponseItem)

export type AIResponseItemType = z.infer<typeof AIResponseItem>

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

export interface AIProvider {
  complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string>
}

class OpenClawAdapter implements AIProvider {
  private openclaw: { ai: { chat: (opts: { messages: unknown[] }) => Promise<{ content: string }> } }

  constructor(openclaw: OpenClawAdapter['openclaw']) {
    this.openclaw = openclaw
  }

  async complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    const r = await this.openclaw.ai.chat({ messages })
    return r.content
  }
}

class AnthropicAdapter implements AIProvider {
  private client: { messages: { create: (opts: unknown) => Promise<{ content: Array<{ text: string }> }> } }

  constructor(client: AnthropicAdapter['client']) {
    this.client = client
  }

  async complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    const r = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      messages,
    })
    return r.content[0].text
  }
}

class FallbackAdapter implements AIProvider {
  async complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    const userPayload = messages[messages.length - 1]?.content ?? ''
    const marker = 'Items:\n'
    const idx = userPayload.indexOf(marker)
    if (idx === -1) {
      return '[]'
    }

    const rawJson = userPayload.slice(idx + marker.length)
    type PromptItem = {
      title?: string
      source?: 'hackernews' | 'reddit' | 'github'
      points?: number
      comments?: number
    }

    let items: PromptItem[] = []
    try {
      items = JSON.parse(rawJson) as PromptItem[]
    } catch {
      return '[]'
    }

    const sourceBoost: Record<'hackernews' | 'reddit' | 'github', number> = {
      hackernews: 0.4,
      reddit: 0.2,
      github: 0.3,
    }

    const scored = items.map(item => {
      const points = item.points ?? 0
      const comments = item.comments ?? 0
      const source = item.source ?? 'hackernews'
      const rawScore = 4.5 + Math.min(points / 200, 2.5) + Math.min(comments / 100, 1.5) + sourceBoost[source]
      const score = Math.max(1, Math.min(10, Math.round(rawScore * 10) / 10))
      const title = (item.title ?? 'Untitled dispatch').trim()

      return {
        score,
        retro_headline: `Dispatch: ${title}`.slice(0, 120),
        retro_summary:
          `Editors marked this ${source} report as noteworthy based on current community activity.` +
          ` This fallback edition uses local scoring when no live AI provider is configured.`,
      }
    })

    console.warn('[ai] No live AI provider available — using deterministic fallback scoring')
    return JSON.stringify(scored)
  }
}

export async function resolveAI(): Promise<AIProvider> {
  // Priority 1: openclaw SDK with active session
  try {
    const { openclaw } = await import('@openclaw/sdk' as string) as { openclaw: { isReady: () => boolean; ai: OpenClawAdapter['openclaw']['ai'] } }
    if (openclaw.isReady()) {
      return new OpenClawAdapter(openclaw)
    }
  } catch {
    // openclaw not installed or not running — fall through
  }

  // Priority 2: standalone mode with explicit API key
  if (process.env.ANTHROPIC_API_KEY) {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    return new AnthropicAdapter(client.messages as unknown as AnthropicAdapter['client'])
  }

  // Priority 3: local deterministic fallback so the pipeline can still build/test end-to-end
  return new FallbackAdapter()
}

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

  throw new ConfigurationError(
    'No AI provider available. Set ANTHROPIC_API_KEY or ensure openclaw is running.'
  )
}

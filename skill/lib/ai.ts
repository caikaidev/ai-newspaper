import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const OPENCLAW_AGENT_ID = process.env.OPENCLAW_AI_AGENT_ID ?? 'general_agent'
const OPENCLAW_COMMAND = process.env.OPENCLAW_BIN ?? 'openclaw'

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

export interface AIProvider {
  complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string>
}

class OpenClawSdkAdapter implements AIProvider {
  private openclaw: { ai: { chat: (opts: { messages: unknown[] }) => Promise<{ content: string }> } }

  constructor(openclaw: OpenClawSdkAdapter['openclaw']) {
    this.openclaw = openclaw
  }

  async complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    const r = await this.openclaw.ai.chat({ messages })
    return r.content
  }
}

class OpenClawCliAdapter implements AIProvider {
  async complete(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    const prompt = messages
      .map(msg => `${msg.role.toUpperCase()}:\n${msg.content}`)
      .join('\n\n') + '\n\nReturn raw JSON only. No markdown. No commentary.'

    const sessionId = `newspaper-fetch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const { stdout } = await execFileAsync(
      OPENCLAW_COMMAND,
      [
        'agent',
        '--agent',
        OPENCLAW_AGENT_ID,
        '--session-id',
        sessionId,
        '--message',
        prompt,
        '--json',
        '--timeout',
        '120',
      ],
      {
        timeout: 130_000,
        maxBuffer: 2 * 1024 * 1024,
      }
    )

    return extractOpenClawAgentText(stdout)
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
    return buildFallbackResponse(messages)
  }
}

export function extractOpenClawAgentText(stdout: string): string {
  const parsed = JSON.parse(stdout) as {
    status?: string
    result?: { payloads?: Array<{ text?: string | null }> }
  }

  const text = parsed.result?.payloads?.find(payload => typeof payload.text === 'string')?.text
  if (!text) {
    throw new ConfigurationError('OpenClaw agent returned no text payload')
  }

  return text
}

export function buildFallbackResponse(messages: Array<{ role: 'user' | 'assistant'; content: string }>): string {
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
      retro_headline_zh: `快讯：${title}`.slice(0, 120),
      retro_summary_zh: `编辑部依据当前社群热度，将这则来自 ${source} 的报道列为值得关注的条目。此回退版本在未配置在线 AI 能力时使用本地确定性评分与双语占位文案。`,
    }
  })

  console.warn('[ai] No live AI provider available — using deterministic fallback scoring')
  return JSON.stringify(scored)
}

async function tryResolveOpenClawSdk(): Promise<AIProvider | null> {
  try {
    const { openclaw } = await import('@openclaw/sdk' as string) as { openclaw: { isReady: () => boolean; ai: OpenClawSdkAdapter['openclaw']['ai'] } }
    if (openclaw.isReady()) {
      return new OpenClawSdkAdapter(openclaw)
    }
  } catch {
  }

  return null
}

async function tryResolveOpenClawCli(): Promise<AIProvider | null> {
  try {
    await execFileAsync(OPENCLAW_COMMAND, ['status'], {
      timeout: 15_000,
      maxBuffer: 512 * 1024,
    })
    return new OpenClawCliAdapter()
  } catch {
    return null
  }
}

export async function resolveAI(): Promise<AIProvider> {
  const sdk = await tryResolveOpenClawSdk()
  if (sdk) return sdk

  const openclawCli = await tryResolveOpenClawCli()
  if (openclawCli) return openclawCli

  if (process.env.ANTHROPIC_API_KEY) {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    return new AnthropicAdapter(client.messages as unknown as AnthropicAdapter['client'])
  }

  return new FallbackAdapter()
}

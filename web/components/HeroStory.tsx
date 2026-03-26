import type { ScoredItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { localizedHeadline, localizedSummary, t } from '@/lib/i18n'

interface HeroStoryProps {
  item: ScoredItem
  lang: AppLang
}

const SOURCE_LABELS: Record<string, { en: string; 'zh-CN': string }> = {
  hackernews: { en: 'Hacker News', 'zh-CN': 'Hacker News' },
  reddit: { en: 'Reddit', 'zh-CN': 'Reddit' },
  github: { en: 'GitHub', 'zh-CN': 'GitHub' },
}

export default function HeroStory({ item, lang }: HeroStoryProps) {
  const m = t(lang)
  const sourceMeta = [
    SOURCE_LABELS[item.source]?.[lang] ?? item.source,
    item.subreddit ? `r/${item.subreddit}` : null,
    item.points ? `${item.points.toLocaleString()} ${m.points}` : null,
    item.comments ? `${item.comments.toLocaleString()} ${m.comments}` : null,
    item.stars ? `★ ${item.stars.toLocaleString()}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const headline = localizedHeadline(item, lang)
  const summary = localizedSummary(item, lang)

  return (
    <article className="hero">
      <h2 className="hero__headline">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {headline}
        </a>
      </h2>
      {summary && <p className="hero__summary">{summary}</p>}
      <div className="hero__meta">
        <span className="score-badge">{item.ai_score.toFixed(1)}</span>
        <span>{sourceMeta}</span>
      </div>
    </article>
  )
}

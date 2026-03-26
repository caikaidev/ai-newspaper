import type { ScoredItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

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

  return (
    <article className="hero">
      <h2 className="hero__headline">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.retro_headline || item.title}
        </a>
      </h2>
      {item.retro_summary && (
        <p className="hero__summary">{item.retro_summary}</p>
      )}
      <div className="hero__meta">
        <span className="score-badge">{item.ai_score.toFixed(1)}</span>
        <span>{sourceMeta}</span>
      </div>
    </article>
  )
}

import type { ScoredItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface ColStoryProps {
  item: ScoredItem
  rank?: number
  lang: AppLang
}

export default function ColStory({ item, rank, lang }: ColStoryProps) {
  const m = t(lang)
  const meta = [
    item.points ? `${item.points.toLocaleString()} ${m.points}` : null,
    item.comments ? `${item.comments.toLocaleString()} ${m.comments}` : null,
    item.stars ? `★ ${item.stars.toLocaleString()}` : null,
    item.subreddit ? `r/${item.subreddit}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="col-story">
      <h3 className="col-story__headline">
        {rank && <span style={{ color: 'var(--aged-caption)', marginRight: '0.3em' }}>{rank}.</span>}
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.retro_headline || item.title}
        </a>
      </h3>
      {item.retro_summary && (
        <p className="col-story__summary">{item.retro_summary}</p>
      )}
      <div className="col-story__meta">
        <span className="score-badge">{item.ai_score.toFixed(1)}</span>
        {meta && <span>{meta}</span>}
      </div>
    </article>
  )
}

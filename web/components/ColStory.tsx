import type { ScoredItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { localizedHeadline, localizedSummary, t } from '@/lib/i18n'

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
    item.installs ? `${item.installs.toLocaleString()} ${m.installs}` : null,
    item.skill_rank ? `${m.rank} #${item.skill_rank}` : null,
    item.owner ? item.owner : null,
    item.source_label ? item.source_label : null,
    item.subreddit ? `r/${item.subreddit}` : null,
  ].filter(Boolean).join(' · ')

  const headline = localizedHeadline(item, lang)
  const summary = localizedSummary(item, lang)

  return (
    <article className="col-story">
      <h3 className="col-story__headline">
        {rank && <span style={{ color: 'var(--aged-caption)', marginRight: '0.3em' }}>{rank}.</span>}
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {headline}
        </a>
      </h3>
      {summary && <p className="col-story__summary">{summary}</p>}
      <div className="col-story__meta">
        <span className="score-badge">{item.ai_score.toFixed(1)}</span>
        {meta && <span>{meta}</span>}
      </div>
    </article>
  )
}

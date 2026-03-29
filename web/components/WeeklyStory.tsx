import Link from 'next/link'
import type { WeeklyItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { localizedHeadline, localizedSummary, t } from '@/lib/i18n'

interface WeeklyStoryProps {
  item: WeeklyItem
  rank?: number
  lang: AppLang
}

export default function WeeklyStory({ item, rank, lang }: WeeklyStoryProps) {
  const m = t(lang)
  const headline = localizedHeadline(item, lang)
  const summary = localizedSummary(item, lang)
  const meta = [
    `${item.weekly_count}×`,
    item.points ? `${item.points.toLocaleString()} ${m.points}` : null,
    item.comments ? `${item.comments.toLocaleString()} ${m.comments}` : null,
    item.stars ? `★ ${item.stars.toLocaleString()}` : null,
    item.installs ? `${item.installs.toLocaleString()} ${m.installs}` : null,
    item.skill_rank ? `${m.rank} #${item.skill_rank}` : null,
    item.source_label ? item.source_label : null,
  ].filter(Boolean).join(' · ')

  return (
    <article className="topic-pick">
      <div className="column__header">{item.weekly_dates.join(' · ')}</div>
      <h3 className="topic-pick__headline">
        {rank && <span style={{ color: 'var(--aged-caption)', marginRight: '0.3em' }}>{rank}.</span>}
        <a href={item.url} target="_blank" rel="noopener noreferrer">{headline}</a>
      </h3>
      {summary && <p className="topic-pick__summary font-body">{summary}</p>}
      <div className="col-story__meta" style={{ marginTop: '0.5rem' }}>
        <span className="score-badge">{item.ai_score.toFixed(1)}</span>
        <span>{meta}</span>
      </div>
      <div className="skills-page-links skills-page-links--left font-body">
        {item.weekly_dates.map((date, index) => (
          <span key={date}>
            <Link href={`/${date}`}>{date}</Link>
            {index < item.weekly_dates.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </div>
    </article>
  )
}

import type { ScoredItem } from '@/lib/types'

interface HeroStoryProps {
  item: ScoredItem
}

const SOURCE_LABELS: Record<string, string> = {
  hackernews: 'Hacker News',
  reddit: 'Reddit',
  github: 'GitHub',
}

export default function HeroStory({ item }: HeroStoryProps) {
  const sourceMeta = [
    SOURCE_LABELS[item.source] ?? item.source,
    item.subreddit ? `r/${item.subreddit}` : null,
    item.points ? `${item.points.toLocaleString()} pts` : null,
    item.comments ? `${item.comments.toLocaleString()} comments` : null,
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

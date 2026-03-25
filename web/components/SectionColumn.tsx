import type { ScoredItem } from '@/lib/types'
import ColStory from './ColStory'

interface SectionColumnProps {
  title: string
  items: ScoredItem[]
}

export default function SectionColumn({ title, items }: SectionColumnProps) {
  return (
    <div className="section-col">
      <div className="column__header">{title}</div>
      {items.length === 0 ? (
        <p
          className="font-caption"
          style={{ fontSize: '0.8rem', color: 'var(--aged-caption)' }}
        >
          No dispatches received this day.
        </p>
      ) : (
        items.map((item, i) => (
          <ColStory key={item.id} item={item} rank={i + 1} />
        ))
      )}
    </div>
  )
}

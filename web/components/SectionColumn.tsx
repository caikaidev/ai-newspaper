import type { ScoredItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import ColStory from './ColStory'

interface SectionColumnProps {
  title: string
  items: ScoredItem[]
  lang: AppLang
}

export default function SectionColumn({ title, items, lang }: SectionColumnProps) {
  const m = t(lang)

  return (
    <div className="section-col">
      <div className="column__header">{title}</div>
      {items.length === 0 ? (
        <p
          className="font-caption"
          style={{ fontSize: '0.8rem', color: 'var(--aged-caption)' }}
        >
          {m.noDispatches}
        </p>
      ) : (
        items.map((item, i) => (
          <ColStory key={item.id} item={item} rank={i + 1} lang={lang} />
        ))
      )}
    </div>
  )
}

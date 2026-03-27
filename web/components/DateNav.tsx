import Link from 'next/link'
import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface DateNavProps {
  date: string
  editions: string[]
  lang: AppLang
  basePath?: string
  latestHref?: string
}

export default function DateNav({ date, editions, lang, basePath = '', latestHref }: DateNavProps) {
  const m = t(lang)
  const currentIndex = editions.indexOf(date)
  const prevDate = editions[currentIndex + 1] ?? null
  const nextDate = editions[currentIndex - 1] ?? null
  const isLatest = currentIndex === 0
  const buildHref = (targetDate: string) => `${basePath}/${targetDate}`.replace(/\/+/g, '/')
  const latestLink = latestHref ?? (basePath ? basePath : '/')

  return (
    <nav className="date-nav" aria-label={m.editionNavigation}>
      {prevDate ? (
        <Link href={buildHref(prevDate)} aria-label={`${m.previousEdition}: ${prevDate}`}>
          ← {prevDate}
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>←</span>
      )}

      <span>{date}</span>

      {nextDate ? (
        <Link href={buildHref(nextDate)} aria-label={`${m.nextEdition}: ${nextDate}`}>
          {nextDate} →
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>→</span>
      )}

      {!isLatest && (
        <Link href={latestLink} aria-label={m.latestEdition}>
          {m.today} ↑
        </Link>
      )}
    </nav>
  )
}

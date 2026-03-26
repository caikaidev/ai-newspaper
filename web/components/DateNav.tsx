import Link from 'next/link'
import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface DateNavProps {
  date: string
  editions: string[] // sorted newest-first
  lang: AppLang
}

export default function DateNav({ date, editions, lang }: DateNavProps) {
  const m = t(lang)
  const currentIndex = editions.indexOf(date)
  const prevDate = editions[currentIndex + 1] ?? null // older
  const nextDate = editions[currentIndex - 1] ?? null // newer
  const isLatest = currentIndex === 0

  return (
    <nav className="date-nav" aria-label={m.editionNavigation}>
      {prevDate ? (
        <Link href={`/${prevDate}`} aria-label={`${m.previousEdition}: ${prevDate}`}>
          ← {prevDate}
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>←</span>
      )}

      <span>{date}</span>

      {nextDate ? (
        <Link href={`/${nextDate}`} aria-label={`${m.nextEdition}: ${nextDate}`}>
          {nextDate} →
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>→</span>
      )}

      {!isLatest && (
        <Link href="/" aria-label={m.latestEdition}>
          {m.today} ↑
        </Link>
      )}
    </nav>
  )
}

import Link from 'next/link'

interface DateNavProps {
  date: string
  editions: string[] // sorted newest-first
}

export default function DateNav({ date, editions }: DateNavProps) {
  const currentIndex = editions.indexOf(date)
  const prevDate = editions[currentIndex + 1] ?? null // older
  const nextDate = editions[currentIndex - 1] ?? null // newer
  const isLatest = currentIndex === 0

  return (
    <nav className="date-nav" aria-label="Edition navigation">
      {prevDate ? (
        <Link href={`/${prevDate}`} aria-label={`Previous edition: ${prevDate}`}>
          ← {prevDate}
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>←</span>
      )}

      <span>{date}</span>

      {nextDate ? (
        <Link href={`/${nextDate}`} aria-label={`Next edition: ${nextDate}`}>
          {nextDate} →
        </Link>
      ) : (
        <span style={{ visibility: 'hidden' }}>→</span>
      )}

      {!isLatest && (
        <Link href="/" aria-label="Latest edition">
          Today ↑
        </Link>
      )}
    </nav>
  )
}

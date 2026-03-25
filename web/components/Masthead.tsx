interface MastheadProps {
  date?: string
  edition?: number
}

export default function Masthead({ date, edition }: MastheadProps) {
  const displayDate = date
    ? new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : 'Est. MMXXVI'

  return (
    <header className="masthead">
      <h1 className="masthead__name">The Daily Byte</h1>
      <div className="masthead__meta">
        <span>{displayDate}</span>
        <span>Curated by Artificial Intelligence · Printed in the Manner of 1920</span>
        {edition ? <span>Vol. I, No. {edition}</span> : <span>Vol. I, No. 0</span>}
      </div>
    </header>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Masthead from '@/components/Masthead'
import OnboardingPage from '@/components/OnboardingPage'
import WeeklyStory from '@/components/WeeklyStory'
import { getRequestLang, t } from '@/lib/i18n'
import { buildWeeklyEdition, listWeeks } from '@/lib/weekly'
import { weeklyMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/structured-data'

export const revalidate = 3600

interface PageProps {
  params: { week: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = getRequestLang()
  return weeklyMetadata(params.week, lang)
}

export default function WeeklyPage({ params }: PageProps) {
  const weeks = listWeeks()
  const lang = getRequestLang()
  const m = t(lang)

  if (weeks.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  const weekly = buildWeeklyEdition(params.week)
  if (!weekly) notFound()

  const jsonLd = [
    collectionPageJsonLd({
      path: `/weekly/${params.week}`,
      name: `${params.week} ${m.weeklyRoundup}`,
      description: m.weeklyIntro,
      lang,
      items: weekly.items,
    }),
    breadcrumbJsonLd([
      { name: m.siteName, path: '/' },
      { name: `${params.week} ${m.weeklyRoundup}`, path: `/weekly/${params.week}` },
    ]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={m.weeklyRoundup}>
        <Masthead lang={lang} redirectTo={`/weekly/${params.week}`} />

        <section aria-label={m.weeklyRoundup}>
          <h2 className="section-header">§ {params.week} · {m.weeklyRoundup}</h2>
          <p className="archive-intro font-body">{m.weeklyIntro}</p>
          <div className="skills-page-links font-body">
            <Link href="/archive">{m.archivePage}</Link>
            <span>·</span>
            <Link href="/skills">{m.skillsPage}</Link>
            <span>·</span>
            <Link href={`/${weekly.dates[0]}`}>{m.browseLatestEdition}</Link>
          </div>
          <div className="skills-hero-note font-body">
            {m.weekIncludes} {weekly.dates.join(' · ')}
          </div>
        </section>

        <section aria-label={m.weeklyHighlights}>
          <h2 className="section-header">§ {m.weeklyHighlights}</h2>
          <div className="topic-picks-list">
            {weekly.items.map((item, index) => (
              <WeeklyStory key={item.url || item.id} item={item} rank={index + 1} lang={lang} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

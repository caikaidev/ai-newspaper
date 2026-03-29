import type { Metadata } from 'next'
import Link from 'next/link'
import { listEditions } from '@/lib/editions'
import { getRequestLang, t } from '@/lib/i18n'
import { skillsArchiveMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/structured-data'
import Masthead from '@/components/Masthead'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLang()
  return skillsArchiveMetadata(lang)
}

export default function SkillsArchivePage() {
  const editions = listEditions()
  const lang = getRequestLang()
  const m = t(lang)

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  const jsonLd = [
    collectionPageJsonLd({
      path: '/skills/archive',
      name: m.skillsArchivePage,
      description: m.skillsArchiveIntro,
      lang,
    }),
    breadcrumbJsonLd([
      { name: m.siteName, path: '/' },
      { name: m.skillsPage, path: '/skills' },
      { name: m.skillsArchivePage, path: '/skills/archive' },
    ]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={m.skillsArchivePage}>
        <Masthead lang={lang} redirectTo="/skills/archive" />

        <section aria-label={m.skillsArchivePage}>
          <h2 className="section-header">§ {m.skillsArchivePage}</h2>
          <p className="section-subhead font-body">{m.seoSecondarySkillsArchive}</p>
          <p className="archive-intro font-body">{m.skillsArchiveIntro}</p>
          <div className="skills-page-links font-body">
            <Link href="/skills">{m.latestSkillsHub}</Link>
            <span>·</span>
            <Link href="/topics/skills">{m.skillsTopicPage}</Link>
            <span>·</span>
            <Link href="/archive">{m.archivePage}</Link>
          </div>
          <div className="archive-table font-body">
            <div className="archive-table__head">
              <span>Date</span>
              <span>{m.skillRadarEdition}</span>
              <span>{m.mainEdition}</span>
            </div>
            <div className="archive-table__body">
              {editions.map(date => (
                <div key={date} className="archive-table__row">
                  <span className="archive-table__date">{date}</span>
                  <Link href={`/skills/${date}`}>{m.skillRadarEdition}</Link>
                  <Link href={`/${date}`}>{m.mainEdition}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

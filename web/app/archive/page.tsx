import type { Metadata } from 'next'
import Link from 'next/link'
import { listEditions } from '@/lib/editions'
import { getRequestLang, t } from '@/lib/i18n'
import { archiveMetadata } from '@/lib/seo'
import Masthead from '@/components/Masthead'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLang()
  return archiveMetadata(lang)
}

export default function ArchivePage() {
  const editions = listEditions()
  const lang = getRequestLang()
  const m = t(lang)

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  return (
    <>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={m.archivePage}>
        <Masthead lang={lang} redirectTo="/archive" />

        <section aria-label={m.archivePage}>
          <h2 className="section-header">§ {m.archivePage}</h2>
          <p className="archive-intro font-body">{m.archiveIntro}</p>
          <div className="skills-page-links font-body">
            <Link href="/">{m.browseLatestEdition}</Link>
            <span>·</span>
            <Link href="/skills">{m.skillsPage}</Link>
            <span>·</span>
            <Link href="/topics/skills">{m.skillsTopicPage}</Link>
          </div>
          <div className="archive-table font-body">
            <div className="archive-table__head">
              <span>Date</span>
              <span>{m.mainEdition}</span>
              <span>{m.skillRadarEdition}</span>
            </div>
            <div className="archive-table__body">
              {editions.map(date => (
                <div key={date} className="archive-table__row">
                  <span className="archive-table__date">{date}</span>
                  <Link href={`/${date}`}>{m.mainEdition}</Link>
                  <Link href={`/skills/${date}`}>{m.skillRadarEdition}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-label={m.relatedPaths}>
          <h2 className="section-header">§ {m.relatedPaths}</h2>
          <div className="skills-hub-grid">
            <div className="skills-hub-panel">
              <div className="column__header">{m.relatedPaths}</div>
              <p className="font-body skills-hub-copy">{m.archiveAndTopicsNote}</p>
              <div className="skills-page-links skills-page-links--left font-body">
                <Link href="/skills">{m.latestSkillsHub}</Link>
                <span>·</span>
                <Link href="/topics/skills">{m.skillsTopicPage}</Link>
                <span>·</span>
                <Link href={`/${editions[0]}`}>{m.browseLatestEdition}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

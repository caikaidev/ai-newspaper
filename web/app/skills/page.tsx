import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listEditions, loadEdition } from '@/lib/editions'
import { getRequestLang, t } from '@/lib/i18n'
import { labelForLang, loadConfig } from '@/lib/config'
import { skillsHubMetadata } from '@/lib/seo'
import Masthead from '@/components/Masthead'
import SectionColumn from '@/components/SectionColumn'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLang()
  return skillsHubMetadata(lang)
}

export default function SkillsRootPage() {
  const editions = listEditions()
  const lang = getRequestLang()

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  const latestDate = editions[0]
  const edition = loadEdition(latestDate)
  if (!edition) notFound()

  const m = t(lang)
  const config = loadConfig()
  const skillsConfig = config.sources.skills
  const recentDates = editions.slice(0, 7)

  return (
    <>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={labelForLang(skillsConfig.label, lang)}>
        <Masthead date={edition.date} edition={edition.edition} lang={lang} redirectTo="/skills" />

        <section aria-label={labelForLang(skillsConfig.label, lang)}>
          <h2 className="section-header">§ {labelForLang(skillsConfig.label, lang)}</h2>
          <p className="skills-hub-intro font-body">{m.skillsHubIntro}</p>
          <div className="skills-hero-note font-body">
            {edition.sections.skills.length} {m.skillsTracked}. {m.aiScoredNote}
          </div>
          <div className="section-columns">
            {skillsConfig.groups.map(group => (
              <SectionColumn
                key={group.key}
                title={labelForLang(group.label, lang)}
                items={edition.sections.skills.slice(group.slice[0], group.slice[1])}
                lang={lang}
              />
            ))}
          </div>
        </section>

        <section aria-label={m.recentSkillEditions}>
          <h2 className="section-header">§ {m.recentSkillEditions}</h2>
          <div className="skills-hub-grid">
            <div className="skills-hub-panel">
              <div className="column__header">{m.latestRadar}</div>
              <p className="font-body skills-hub-copy">{m.latestSkillsArchiveNote}</p>
              <div className="skills-page-links skills-page-links--left font-body">
                <Link href={`/skills/${latestDate}`}>{latestDate}</Link>
                <span>·</span>
                <Link href={`/${latestDate}`}>{m.viewFullEdition}</Link>
                <span>·</span>
                <Link href="/skills/archive">{m.skillsArchivePage}</Link>
                <span>·</span>
                <Link href="/archive">{m.archivePage}</Link>
                <span>·</span>
                <Link href="/topics/skills">{m.skillsTopicPage}</Link>
              </div>
            </div>

            <div className="skills-hub-panel">
              <div className="column__header">{m.recentSkillEditions}</div>
              <ul className="skills-edition-list font-body">
                {recentDates.map(date => (
                  <li key={date}>
                    <Link href={`/skills/${date}`}>{date}</Link>
                    <span>·</span>
                    <Link href={`/${date}`}>{m.viewFullEdition}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { listEditions, loadEdition } from '@/lib/editions'
import Masthead from '@/components/Masthead'
import DateNav from '@/components/DateNav'
import SectionColumn from '@/components/SectionColumn'
import { getRequestLang, t } from '@/lib/i18n'
import { labelForLang, loadConfig } from '@/lib/config'
import { skillsEditionMetadata } from '@/lib/seo'

export const revalidate = 3600

interface PageProps {
  params: { date: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const edition = loadEdition(params.date)
  const lang = getRequestLang()
  const m = t(lang)

  if (!edition) return { title: `${m.notFound} — ${m.siteName}` }
  return skillsEditionMetadata(params.date, lang)
}

export default function SkillsEditionPage({ params }: PageProps) {
  const edition = loadEdition(params.date)
  if (!edition) notFound()

  const config = loadConfig()
  const lang = getRequestLang()
  const m = t(lang)
  const editions = listEditions()
  const skillsConfig = config.sources.skills

  return (
    <>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={labelForLang(skillsConfig.label, lang)}>
        <Masthead date={edition.date} edition={edition.edition} lang={lang} redirectTo={`/skills/${params.date}`} />
        <DateNav date={params.date} editions={editions} lang={lang} basePath="/skills" latestHref="/skills" />

        <section aria-label={labelForLang(skillsConfig.label, lang)}>
          <h2 className="section-header">§ {labelForLang(skillsConfig.label, lang)}</h2>
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

        <div className="skills-page-links font-body">
          <a href={`/${params.date}`}>{m.siteName}</a>
          <span>·</span>
          <a href="/skills">{labelForLang(skillsConfig.label, lang)}</a>
        </div>
      </main>
    </>
  )
}

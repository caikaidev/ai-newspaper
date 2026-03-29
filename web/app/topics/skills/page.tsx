import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listEditions, loadEdition } from '@/lib/editions'
import { getRequestLang, localizedHeadline, localizedSummary, t } from '@/lib/i18n'
import { topicSkillsMetadata } from '@/lib/seo'
import Masthead from '@/components/Masthead'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLang()
  return topicSkillsMetadata(lang)
}

export default function TopicSkillsPage() {
  const editions = listEditions()
  const lang = getRequestLang()
  const m = t(lang)

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  const latestDate = editions[0]
  const latestEdition = loadEdition(latestDate)
  if (!latestEdition) notFound()

  const picks = editions
    .slice(0, 5)
    .map(date => ({ date, edition: loadEdition(date) }))
    .filter((entry): entry is { date: string; edition: NonNullable<ReturnType<typeof loadEdition>> } => Boolean(entry.edition))
    .map(({ date, edition }) => ({
      date,
      item: edition.sections.skills[0],
    }))
    .filter((entry): entry is { date: string; item: NonNullable<(typeof latestEdition.sections.skills)[number]> } => Boolean(entry.item))

  return (
    <>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={m.skillsTopicPage}>
        <Masthead date={latestEdition.date} edition={latestEdition.edition} lang={lang} redirectTo="/topics/skills" />

        <section aria-label={m.skillsTopicPage}>
          <h2 className="section-header">§ {m.skillsTopicPage}</h2>
          <p className="archive-intro font-body">{m.skillsTopicIntro}</p>
          <div className="skills-page-links font-body">
            <Link href="/skills">{m.exploreSkillRadar}</Link>
            <span>·</span>
            <Link href="/archive">{m.browseSkillArchive}</Link>
            <span>·</span>
            <Link href={`/${latestDate}`}>{m.viewFullEdition}</Link>
          </div>
        </section>

        <section aria-label={m.recentSkillsPicks}>
          <h2 className="section-header">§ {m.recentSkillsPicks}</h2>
          <div className="topic-picks-list">
            {picks.map(({ date, item }) => (
              <article key={`${date}-${item.id}`} className="topic-pick">
                <div className="column__header">{date}</div>
                <h3 className="topic-pick__headline">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{localizedHeadline(item, lang)}</a>
                </h3>
                <p className="topic-pick__summary font-body">{localizedSummary(item, lang)}</p>
                <div className="skills-page-links skills-page-links--left font-body">
                  <Link href={`/skills/${date}`}>{m.exploreSkillRadar}</Link>
                  <span>·</span>
                  <Link href={`/${date}`}>{m.viewFullEdition}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-label={m.relatedPaths}>
          <h2 className="section-header">§ {m.relatedPaths}</h2>
          <div className="skills-hub-grid">
            <div className="skills-hub-panel">
              <div className="column__header">{m.latestRadar}</div>
              <p className="font-body skills-hub-copy">{m.topicHubNote}</p>
              <div className="skills-page-links skills-page-links--left font-body">
                <Link href="/skills">{m.skillsPage}</Link>
                <span>·</span>
                <Link href={`/skills/${latestDate}`}>{latestDate}</Link>
              </div>
            </div>
            <div className="skills-hub-panel">
              <div className="column__header">{m.archivePage}</div>
              <p className="font-body skills-hub-copy">{m.archiveIntro}</p>
              <div className="skills-page-links skills-page-links--left font-body">
                <Link href="/archive">{m.archivePage}</Link>
                <span>·</span>
                <Link href={`/${latestDate}`}>{m.viewFullEdition}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

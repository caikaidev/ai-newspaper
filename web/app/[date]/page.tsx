import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { listEditions, loadEdition } from '@/lib/editions'
import { daysSinceLastRun } from '@/lib/runlog'
import Masthead from '@/components/Masthead'
import DateNav from '@/components/DateNav'
import HeroStory from '@/components/HeroStory'
import ColStory from '@/components/ColStory'
import SectionColumn from '@/components/SectionColumn'
import { getRequestLang, t } from '@/lib/i18n'

export const revalidate = 3600

interface PageProps {
  params: { date: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const edition = loadEdition(params.date)
  const lang = getRequestLang()
  const m = t(lang)
  if (!edition) return { title: `${m.notFound} — ${m.siteName}` }

  const heroHeadline = edition.front_page[0]?.retro_headline ?? m.siteName
  const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'http://localhost:3000'

  return {
    title: `${heroHeadline} — ${m.siteName}`,
    description: edition.front_page[0]?.retro_summary ?? m.siteDescription,
    openGraph: {
      title: `${m.siteName} — ${params.date}`,
      images: [`${BASE_URL}/api/og?date=${params.date}`],
    },
  }
}

export default function EditionPage({ params }: PageProps) {
  const edition = loadEdition(params.date)
  if (!edition) notFound()

  const lang = getRequestLang()
  const m = t(lang)
  const editions = listEditions()
  const staleDays = daysSinceLastRun()
  const showStaleBanner = staleDays !== null && staleDays > 1
  const col1 = edition.front_page.slice(1, 3)
  const col2 = edition.front_page.slice(3, 5)

  return (
    <>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <main className="newspaper" id="main-content" aria-label={m.newspaperAria}>
        <Masthead date={edition.date} edition={edition.edition} lang={lang} redirectTo={`/${params.date}`} />

        <DateNav date={params.date} editions={editions} lang={lang} />

        {showStaleBanner && (
          <div className="staleness-banner" role="status">
            ⚠ {m.lastEditionPublished} {staleDays} {lang === 'zh-CN' ? '天' : `day${staleDays === 1 ? '' : 's'}`} {m.daysAgoSuffix}
          </div>
        )}

        {edition.front_page[0] && <HeroStory item={edition.front_page[0]} lang={lang} />}

        {(col1.length > 0 || col2.length > 0) && (
          <div className="columns" aria-label="Front page stories">
            <div className="column">
              {col1.map((item, i) => (
                <ColStory key={item.id} item={item} rank={i + 2} lang={lang} />
              ))}
            </div>
            <div className="column">
              {col2.map((item, i) => (
                <ColStory key={item.id} item={item} rank={i + 4} lang={lang} />
              ))}
            </div>
            <div className="column column--highlight">
              <div className="column__header">{m.thisEdition}</div>
              <p className="font-body" style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--ink-black)' }}>
                {edition.sections.hackernews.length} {m.dispatchesFromHN}<br />
                {edition.sections.reddit.length} {m.reportsFromReddit}<br />
                {edition.sections.github.length} {m.projectsFromGitHub}<br />
                <br />
                <span style={{ color: 'var(--aged-caption)', fontStyle: 'italic' }}>{m.aiScoredNote}</span>
              </p>
            </div>
          </div>
        )}

        <section aria-label={`${m.hackerNews} dispatches`}>
          <h2 className="section-header">§ {m.hackerNews}</h2>
          <div className="section-columns">
            <SectionColumn title={m.topStories} items={edition.sections.hackernews.slice(0, 5)} lang={lang} />
            <SectionColumn title={m.notable} items={edition.sections.hackernews.slice(5, 10)} lang={lang} />
            <SectionColumn title={m.furtherReading} items={edition.sections.hackernews.slice(10, 15)} lang={lang} />
          </div>
        </section>

        <section aria-label={`${m.reddit} reports`}>
          <h2 className="section-header">§ {m.reddit}</h2>
          <div className="section-columns">
            <SectionColumn title={m.programming} items={edition.sections.reddit.filter(i => i.subreddit === 'programming').slice(0, 5)} lang={lang} />
            <SectionColumn title={m.machineLearning} items={edition.sections.reddit.filter(i => i.subreddit === 'MachineLearning').slice(0, 5)} lang={lang} />
            <SectionColumn title={m.webAndDevops} items={edition.sections.reddit.filter(i => i.subreddit && ['webdev', 'devops'].includes(i.subreddit)).slice(0, 5)} lang={lang} />
          </div>
        </section>

        <section aria-label={`${m.githubTrending} dispatches`}>
          <h2 className="section-header">§ {m.githubTrending}</h2>
          <div className="section-columns">
            <SectionColumn title={m.risingProjects} items={edition.sections.github.slice(0, 5)} lang={lang} />
            <SectionColumn title={m.newArrivals} items={edition.sections.github.slice(5, 10)} lang={lang} />
            <SectionColumn title={m.furtherNotice} items={edition.sections.github.slice(10, 15)} lang={lang} />
          </div>
        </section>

        <footer className="footer">
          <p>
            {m.siteName} · {m.publishedDailyAt} ·{' '}
            <a href="/feed.xml" aria-label={m.rssFeed}>{m.rssFeed}</a> ·{' '}
            <a href="https://github.com/caikaidev/ai-newspaper" target="_blank" rel="noopener noreferrer">{m.openSource}</a>
          </p>
          <p style={{ marginTop: '0.25rem' }}>{m.footerDisclaimer}</p>
        </footer>
      </main>
    </>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { listEditions, loadEdition } from '@/lib/editions'
import { daysSinceLastRun } from '@/lib/runlog'
import Masthead from '@/components/Masthead'
import DateNav from '@/components/DateNav'
import HeroStory from '@/components/HeroStory'
import ColStory from '@/components/ColStory'
import SectionColumn from '@/components/SectionColumn'

// Dynamic SSR — no generateStaticParams
// New editions work immediately without rebuild
export const revalidate = 3600

interface PageProps {
  params: { date: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const edition = loadEdition(params.date)
  if (!edition) return { title: 'Not Found — The Daily Byte' }

  const heroHeadline = edition.front_page[0]?.retro_headline ?? 'The Daily Byte'
  const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'http://localhost:3000'

  return {
    title: `${heroHeadline} — The Daily Byte`,
    description: edition.front_page[0]?.retro_summary,
    openGraph: {
      title: `The Daily Byte — ${params.date}`,
      images: [`${BASE_URL}/api/og?date=${params.date}`],
    },
  }
}

export default function EditionPage({ params }: PageProps) {
  const edition = loadEdition(params.date)
  if (!edition) notFound()

  const editions = listEditions()
  const staleDays = daysSinceLastRun()
  const showStaleBanner = staleDays !== null && staleDays > 1

  // Front page columns: items ranked 2–7 (hero takes rank 1)
  const col1 = edition.front_page.slice(1, 3)
  const col2 = edition.front_page.slice(3, 5)

  return (
    <>
      <a className="sr-only" href="#main-content">Skip to main content</a>
      <main className="newspaper" id="main-content" aria-label="The Daily Byte newspaper">
        <Masthead date={edition.date} edition={edition.edition} />

        <DateNav date={params.date} editions={editions} />

        {showStaleBanner && (
          <div className="staleness-banner" role="status">
            ⚠ Last edition published {staleDays} day{staleDays === 1 ? '' : 's'} ago — pipeline may need attention.
          </div>
        )}

        {/* Hero Story */}
        {edition.front_page[0] && (
          <HeroStory item={edition.front_page[0]} />
        )}

        {/* Front page columns */}
        {(col1.length > 0 || col2.length > 0) && (
          <div className="columns" aria-label="Front page stories">
            <div className="column">
              {col1.map((item, i) => (
                <ColStory key={item.id} item={item} rank={i + 2} />
              ))}
            </div>
            <div className="column">
              {col2.map((item, i) => (
                <ColStory key={item.id} item={item} rank={i + 4} />
              ))}
            </div>
            <div className="column">
              <div className="column__header">This Edition</div>
              <p className="font-body" style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--ink-black)' }}>
                {edition.sections.hackernews.length} dispatches from Hacker News<br />
                {edition.sections.reddit.length} reports from Reddit<br />
                {edition.sections.github.length} projects from GitHub<br />
                <br />
                <span style={{ color: 'var(--aged-caption)', fontStyle: 'italic' }}>
                  Scored and rewritten by artificial intelligence
                  in the manner of 1920s inter-war correspondence.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Section columns */}
        <section aria-label="Hacker News dispatches">
          <h2 className="section-header">§ Hacker News</h2>
          <div className="section-columns">
            <SectionColumn title="Top Stories" items={edition.sections.hackernews.slice(0, 5)} />
            <SectionColumn title="Notable" items={edition.sections.hackernews.slice(5, 10)} />
            <SectionColumn title="Further Reading" items={edition.sections.hackernews.slice(10, 15)} />
          </div>
        </section>

        <section aria-label="Reddit reports">
          <h2 className="section-header">§ Reddit</h2>
          <div className="section-columns">
            <SectionColumn title="Programming" items={edition.sections.reddit.filter(i => i.subreddit === 'programming').slice(0, 5)} />
            <SectionColumn title="Machine Learning" items={edition.sections.reddit.filter(i => i.subreddit === 'MachineLearning').slice(0, 5)} />
            <SectionColumn title="Web & DevOps" items={edition.sections.reddit.filter(i => i.subreddit && ['webdev', 'devops'].includes(i.subreddit)).slice(0, 5)} />
          </div>
        </section>

        <section aria-label="GitHub Trending">
          <h2 className="section-header">§ GitHub Trending</h2>
          <div className="section-columns">
            <SectionColumn title="Rising Projects" items={edition.sections.github.slice(0, 5)} />
            <SectionColumn title="New Arrivals" items={edition.sections.github.slice(5, 10)} />
            <SectionColumn title="Further Notice" items={edition.sections.github.slice(10, 15)} />
          </div>
        </section>

        <footer className="footer">
          <p>
            The Daily Byte · Published daily at 07:00 UTC ·{' '}
            <a href="/feed.xml" aria-label="RSS Feed">RSS Feed</a> ·{' '}
            <a
              href="https://github.com/daily-byte/newspaper"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Source
            </a>
          </p>
          <p style={{ marginTop: '0.25rem' }}>
            All headlines composed by artificial intelligence in the manner of 1920s inter-war
            correspondence. No editors were harmed.
          </p>
        </footer>
      </main>
    </>
  )
}

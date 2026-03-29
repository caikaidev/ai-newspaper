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
import { labelForLang, loadConfig } from '@/lib/config'
import { editionMetadata } from '@/lib/seo'

export const revalidate = 3600

interface PageProps {
  params: { date: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const edition = loadEdition(params.date)
  const lang = getRequestLang()
  const m = t(lang)
  if (!edition) return { title: `${m.notFound} — ${m.siteName}` }

  return editionMetadata(
    params.date,
    edition.front_page[0]?.retro_headline,
    edition.front_page[0]?.retro_summary,
    lang
  )
}

export default function EditionPage({ params }: PageProps) {
  const edition = loadEdition(params.date)
  if (!edition) notFound()

  const config = loadConfig()
  const lang = getRequestLang()
  const m = t(lang)
  const editions = listEditions()
  const staleDays = daysSinceLastRun()
  const showStaleBanner = staleDays !== null && staleDays > 1
  const col1 = edition.front_page.slice(1, 3)
  const col2 = edition.front_page.slice(3, 5)
  const enabled = config.sources

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
              {col1.map((item, i) => <ColStory key={item.id} item={item} rank={i + 2} lang={lang} />)}
            </div>
            <div className="column">
              {col2.map((item, i) => <ColStory key={item.id} item={item} rank={i + 4} lang={lang} />)}
            </div>
            <div className="column column--highlight">
              <div className="column__header">{m.thisEdition}</div>
              <p className="font-body" style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--ink-black)' }}>
                {enabled.hackernews.enabled && <>{edition.sections.hackernews.length} {m.dispatchesFromHN}<br /></>}
                {enabled.reddit.enabled && <>{edition.sections.reddit.length} {m.reportsFromReddit}<br /></>}
                {enabled.github.enabled && <>{edition.sections.github.length} {m.projectsFromGitHub}<br /></>}
                {enabled.skills.enabled && <>{edition.sections.skills.length} {m.skillsTracked}<br /></>}
                <br />
                <span style={{ color: 'var(--aged-caption)', fontStyle: 'italic' }}>{m.aiScoredNote}</span>
              </p>
            </div>
          </div>
        )}

        {enabled.skills.enabled && edition.sections.skills.length > 0 && (
          <section aria-label={labelForLang(enabled.skills.label, lang)}>
            <h2 className="section-header">§ {labelForLang(enabled.skills.label, lang)}</h2>
            <div className="section-columns">
              {enabled.skills.groups.map(group => (
                <SectionColumn
                  key={group.key}
                  title={labelForLang(group.label, lang)}
                  items={edition.sections.skills.slice(group.slice[0], group.slice[1])}
                  lang={lang}
                />
              ))}
            </div>
            <div className="skills-page-links font-body">
              <a href="/skills">{labelForLang(enabled.skills.label, lang)}</a>
            </div>
          </section>
        )}

        {enabled.hackernews.enabled && (
          <section aria-label={`${labelForLang(enabled.hackernews.label, lang)} dispatches`}>
            <h2 className="section-header">§ {labelForLang(enabled.hackernews.label, lang)}</h2>
            <div className="section-columns">
              <SectionColumn title={m.topStories} items={edition.sections.hackernews.slice(0, 5)} lang={lang} />
              <SectionColumn title={m.notable} items={edition.sections.hackernews.slice(5, 10)} lang={lang} />
              <SectionColumn title={m.furtherReading} items={edition.sections.hackernews.slice(10, 15)} lang={lang} />
            </div>
          </section>
        )}

        {enabled.reddit.enabled && (
          <section aria-label={`${labelForLang(enabled.reddit.label, lang)} reports`}>
            <h2 className="section-header">§ {labelForLang(enabled.reddit.label, lang)}</h2>
            <div className="section-columns">
              {enabled.reddit.groups.map(group => (
                <SectionColumn
                  key={group.key}
                  title={labelForLang(group.label, lang)}
                  items={edition.sections.reddit.filter(i => i.subreddit && group.match.includes(i.subreddit)).slice(0, 5)}
                  lang={lang}
                />
              ))}
            </div>
          </section>
        )}

        {enabled.github.enabled && (
          <section aria-label={`${labelForLang(enabled.github.label, lang)} dispatches`}>
            <h2 className="section-header">§ {labelForLang(enabled.github.label, lang)}</h2>
            <div className="section-columns">
              <SectionColumn title={m.risingProjects} items={edition.sections.github.slice(0, 5)} lang={lang} />
              <SectionColumn title={m.newArrivals} items={edition.sections.github.slice(5, 10)} lang={lang} />
              <SectionColumn title={m.furtherNotice} items={edition.sections.github.slice(10, 15)} lang={lang} />
            </div>
          </section>
        )}

        <footer className="footer">
          <p>
            {m.siteName} · {m.publishedDailyAt} · <a href="/feed.xml" aria-label={m.rssFeed}>{m.rssFeed}</a> · <a href="/skills">{m.skillsPage}</a> · <a href="https://github.com/caikaidev/ai-newspaper" target="_blank" rel="noopener noreferrer">{m.openSource}</a>
          </p>
          <p style={{ marginTop: '0.25rem' }}>{m.footerDisclaimer}</p>
        </footer>
      </main>
    </>
  )
}

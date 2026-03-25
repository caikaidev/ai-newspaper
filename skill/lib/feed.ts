import fs from 'fs'
import path from 'path'
import { Feed } from 'feed'
import type { Edition } from './types.js'

const MAX_FEED_ENTRIES = 14

export function rebuildFeed(editionsDir: string, editions: Edition[]): void {
  const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'http://localhost:3000'

  const feed = new Feed({
    title: 'The Daily Byte',
    description: 'Daily AI-curated tech headlines in 1920s journalistic prose',
    id: BASE_URL,
    link: BASE_URL,
    language: 'en',
    copyright: '',
    updated: editions[0] ? new Date(editions[0].generated_at) : new Date(),
    feedLinks: { rss: `${BASE_URL}/feed.xml` },
  })

  for (const edition of editions.slice(0, MAX_FEED_ENTRIES)) {
    const top3 = edition.front_page.slice(0, 3)
    feed.addItem({
      title: top3[0]?.retro_headline ?? `The Daily Byte — ${edition.date}`,
      id: `${BASE_URL}/${edition.date}`,
      link: `${BASE_URL}/${edition.date}`,
      date: new Date(edition.generated_at),
      description: top3
        .map(item => `<p><strong>${item.retro_headline}</strong> — ${item.retro_summary}</p>`)
        .join('\n'),
    })
  }

  fs.writeFileSync(path.join(editionsDir, 'feed.xml'), feed.rss2())
}

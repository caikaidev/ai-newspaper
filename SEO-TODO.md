# SEO-TODO

> Priority-ordered task list for evolving The Daily Byte from a daily publishing system into a discoverable, searchable content property.

## P0 — Foundation

- [x] Add `robots.txt`
  - Implemented via `web/app/robots.ts`
  - Includes sitemap reference and host declaration

- [x] Add `sitemap.xml`
  - Implemented via `web/app/sitemap.ts`
  - Includes `/`, `/skills`, `/{date}`, `/skills/{date}`

- [x] Unify metadata strategy across core routes
  - Implemented common metadata helpers in `web/lib/seo.ts`
  - Applied to `/`, `/{date}`, `/skills`, `/skills/{date}`
  - Added canonical URLs for dated and skills pages

- [x] Strengthen `/skills` as a long-lived hub page
  - Replaced redirect-only behavior with an indexable hub experience
  - Added intro copy, latest radar context, and recent skills-edition links
  - Added stronger internal links from `/skills` to dated skills pages and matching full editions

## P1 — Information Architecture

- [x] Add `/archive` page
  - Added indexable `web/app/archive/page.tsx`
  - Linked archive from edition pages, skills pages, footer, and sitemap
  - Archive lists both main editions and matching skills radar editions by date

- [x] Add topic pages
  - Started with indexable `/topics/skills`
  - Added topic-level metadata, recent picks, and links to radar/archive/full editions
  - Established a reusable pattern for later `/topics/ai` and `/topics/devtools`

- [x] Improve internal linking graph
  - Added clearer cross-links among edition, skills, archive, and topic pages
  - Introduced visible “Related Paths” sections on key pages
  - Strengthened topic ↔ edition and topic ↔ skills navigation

- [ ] Add canonical / alternates strategy
  - Canonical URLs for dated pages
  - Consider hreflang strategy if bilingual pages remain shared-route

## P2 — Search-Friendly Aggregation

- [ ] Add weekly roundup pages
  - Example: `/weekly/2026-W13`
  - Include top stories and skills highlights

- [ ] Add skills archive / index page
  - Separate from latest `/skills` landing page
  - Browse historical radar entries

- [ ] Add structured data
  - `CollectionPage`
  - `Article`
  - `BreadcrumbList`

- [ ] Introduce SEO-aware secondary headings
  - Keep editorial headlines
  - Add clearer search-friendly supporting copy where helpful

## P3 — Longer-Term Growth

- [ ] Add SQLite or other indexed content layer
  - Support archive queries
  - Support topic hubs and long-tail page generation

- [ ] Auto-generate evergreen aggregation pages
  - Best-of skills
  - Trending AI tools this month
  - Topic archives

- [ ] Add external distribution workflow
  - Weekly recap snippets
  - Community-share-friendly summaries
  - Social post generation hooks

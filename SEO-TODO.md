# SEO-TODO

> Priority-ordered task list for evolving The Daily Byte from a daily publishing system into a discoverable, searchable content property.

## P0 — Foundation

- [x] Add `robots.txt`
  - Implemented via `web/app/robots.ts`
  - Includes sitemap reference and host declaration
  - Explicitly allows current public SEO routes, including `/archive` and `/topics/*`

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

- [x] Add canonical / alternates strategy
  - Unified alternates generation in `web/lib/seo.ts`
  - Added canonical plus `en`, `zh-CN`, and `x-default` alternates for core routes
  - Current implementation is a shared-route bilingual strategy (same URL, cookie + `Accept-Language` switching), not path-separated hreflang URLs
  - Preserved current bilingual architecture without changing URL structure

## P2 — Search-Friendly Aggregation

- [x] Add weekly roundup pages
  - Added `/weekly/[week]`
  - Aggregates daily front-page winners into a deduplicated weekly view
  - Preserves repeat-signal by showing how many times an item appeared that week and on which dates

- [x] Add structured data
  - Added lightweight JSON-LD helpers in `web/lib/structured-data.ts`
  - Applied `CollectionPage` + `BreadcrumbList` to daily, weekly, archive, and topic pages
  - Included representative `Article` / `ItemList` style entities without overcomplicating route logic

- [x] Add skills archive / index page
  - Added dedicated `/skills/archive`
  - Separate from latest `/skills` landing page and general `/archive`
  - Provides a historical index of dated skills radar editions

- [x] Introduce SEO-aware secondary headings
  - Kept editorial-style primary section headers intact
  - Added clearer explanatory secondary copy to skills, skills archive, weekly, topic, and archive pages
  - Improved search-facing clarity without flattening the newspaper voice

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

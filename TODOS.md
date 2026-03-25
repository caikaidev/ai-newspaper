# TODOS — The Daily Byte

## Deferred from CEO Review (2026-03-24)

### P3 — "This day in tech history" sidebar
- **What**: On each edition page, show 2-3 headlines from the same calendar date 1 year ago.
- **Why**: The archive compounds in value when it references itself. Creates a "time machine" feeling.
- **Current state**: Not useful until 365+ days of editions exist. Requires `loadEdition(date.minusOneYear())` which already works.
- **Where to start**: `app/[date]/page.tsx` — add a `ThisDaySection` component that renders only when prior-year edition exists.
- **Effort**: S (CC: ~20 min) | **Depends on**: 365 days of archive data

### P2 — GitHub Actions deployment mode
- **What**: Daily GH Actions workflow: fetch → AI score → commit JSON → GitHub Pages serves the static site.
- **Why**: Zero-infrastructure deployment. Fork + add `ANTHROPIC_API_KEY` secret = working newspaper. Great for open source adoption.
- **Current state**: Deferred. Self-hosted mode ships first.
- **Where to start**: `.github/workflows/daily-fetch.yml`, set `NEWSPAPER_DATA_DIR=./data/editions`, commit generated files.
- **Effort**: S (CC: ~1 hour) | **Depends on**: Core pipeline working in standalone mode

### P2 — SQLite edition index
- **What**: Store edition metadata (scores, sources, headline text) in a SQLite DB alongside the JSON files.
- **Why**: Enables full-text search across editions, "trending topics over time" queries, and topic-based archive pages.
- **Current state**: File-based JSON is sufficient for v1. SQLite adds ~30 min CC when the time comes.
- **Where to start**: `lib/db.ts` using `better-sqlite3`, indexed on (date, source, ai_score).
- **Effort**: M (CC: ~30 min) | **Depends on**: Stable JSON schema (do this after schema settles)

### P2 — Dark mode / "Evening Edition"
- **What**: A `@media (prefers-color-scheme: dark)` variant with inverted newspaper palette — `#f0e8d4` ink on `#0d0a04` background. Masthead gets gold ink treatment. Calls it the "Evening Edition."
- **Why**: Respects OS dark mode preference + extends the newspaper metaphor (morning/evening editions).
- **Where to start**: CSS custom properties, swap --parchment and --ink-black, add gold masthead variant.
- **Depends on**: Stable color token system (DESIGN.md ✓)
- **Effort**: S (CC: ~20 min) | **Priority**: P2

### P3 — Customizable source list
- **What**: Config file or env vars to specify which HN tags, subreddits, and GitHub categories to include.
- **Why**: Different users care about different tech communities.
- **Where to start**: `newspaper.config.ts` with source definitions, passed into fetch functions.
- **Effort**: S (CC: ~20 min)

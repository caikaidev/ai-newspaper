# The Daily Byte

A retro-style newspaper web app that aggregates daily content from Hacker News, Reddit, and GitHub Trending, scores it with AI, and renders everything in a vintage 1920s broadsheet aesthetic.

## Architecture

```
newspaper-fetch skill (OpenClaw)     Next.js Web App
─────────────────────────────        ─────────────────────────
fetch HN + Reddit + GitHub           reads NEWSPAPER_DATA_DIR
         ↓                                     ↓
   deduplicate by URL               app/page.tsx → redirect
         ↓                          app/[date]/page.tsx → render
    AI scoring & rewrite            app/api/og → Satori OG image
         ↓
  YYYY-MM-DD.json (atomic)
  feed.xml (last 14 editions)
  run.log.json (observability)
```

## Quick Start

### Prerequisites

- Node.js 20+
- Optional for full AI rewriting:
  - openclaw SDK/runtime available, or
  - `ANTHROPIC_API_KEY`
- Without either, the fetch pipeline still runs using a deterministic local fallback scorer (useful for local development and CI smoke tests)

### Install

```bash
git clone <this-repo> && cd newspaper
npm install
bash web/scripts/download-fonts.sh
```

### Fetch your first edition

```bash
export ANTHROPIC_API_KEY=sk-...
npm run fetch
```

If no AI provider is configured, `npm run fetch` still succeeds using fallback scoring so you can validate the end-to-end pipeline.

### Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Verify

```bash
npm run build --workspace=web
npm run typecheck --workspace=web
npm run typecheck --workspace=skill
npm test
```

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `NEWSPAPER_DATA_DIR` | `~/.openclaw/newspaper/editions/` | Where edition JSON files are stored |
| `NEWSPAPER_BASE_URL` | `http://localhost:3000` | Canonical URL for RSS links and OG image links |
| `ANTHROPIC_API_KEY` | — | API key for standalone mode (no openclaw) |

## Notes on source reliability

- Hacker News and GitHub Trending should work without credentials.
- Reddit may intermittently return `403 Blocked` or rate-limit anonymous requests. The pipeline is designed to continue when one source fails, so an edition can still be generated from the remaining sources.

## Schedule

When running as an OpenClaw skill, the pipeline runs at **07:00 UTC** daily.
- ~midnight PT / 3am ET / 8am CET / 3pm CST+8

## Data Format

Each edition is stored as `YYYY-MM-DD.json` with `schema_version: 1`:

```json
{
  "schema_version": 1,
  "date": "2026-03-25",
  "edition": 1,
  "generated_at": "2026-03-25T07:02:14Z",
  "front_page": [...],
  "sections": {
    "hackernews": [...],
    "reddit": [...],
    "github": [...]
  }
}
```

## Features

- 🗞 Vintage 1920s broadsheet aesthetic (UnifrakturMaguntia + Playfair Display + IM Fell English)
- 🤖 AI-scored and rewritten headlines in period journalistic style
- 🧪 Deterministic fallback scoring when no live AI provider is configured
- 📻 RSS feed (`/feed.xml`) with last 14 editions
- 🖼 OG image generation (`/api/og?date=YYYY-MM-DD`) for social sharing
- 🖨 Print stylesheet for real broadsheet printing
- 📱 Responsive — 3-col desktop, 2-col tablet, single-col mobile
- 🔄 Run manifest for idempotent retries
- 🔔 Staleness banner when pipeline hasn't run in >1 day

## Deferred (see TODOS.md)

- GitHub Actions deployment mode (zero-infrastructure)
- SQLite edition index for full-text search
- Dark mode / Evening Edition
- Customizable source list
- "This day in tech history" sidebar (after 365+ editions)

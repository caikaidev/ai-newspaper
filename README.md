# The Daily Byte

A retro-style newspaper web app that aggregates daily content from Hacker News, Reddit, GitHub Trending, and curated AI skills sources, then renders everything in a vintage 1920s broadsheet aesthetic.

## Architecture

```
OpenClaw cron on VPS                     Next.js Web App (Vercel)
────────────────────────────            ─────────────────────────
run publish-edition.sh                  reads repo data/editions
          ↓                                          ↓
fetch HN + Reddit + GitHub + Skills     app/page.tsx → redirect
          ↓                             app/[date]/page.tsx → main edition
AI scoring via local OpenClaw           app/skills/page.tsx → latest skills radar
          ↓                             app/skills/[date]/page.tsx → dated skills radar
          ↓                             app/skills/archive/page.tsx → skills archive index
          ↓                             app/archive/page.tsx → archive index
          ↓                             app/topics/skills/page.tsx → skills topic hub
          ↓                             app/weekly/[week]/page.tsx → weekly roundup
  data/editions/YYYY-MM-DD.json         app/api/og → OG image route
  data/editions/feed.xml                app/feed.xml → RSS route
  data/editions/run.log.json            app/robots.ts → robots.txt
          ↓                             app/sitemap.ts → sitemap.xml
   git commit + push to GitHub
```

## Quick Start

### Prerequisites

- Node.js 20+
- Recommended for production on a VPS:
  - a running OpenClaw gateway/CLI with configured auth profiles (including OAuth-backed OpenAI/OpenAI Codex providers)
- Optional alternatives:
  - project-local OpenClaw SDK/runtime
  - `ANTHROPIC_API_KEY`
- If none of the above are available, the fetch pipeline still runs using a deterministic local fallback scorer (useful for local development and CI smoke tests)

### Install

```bash
git clone https://github.com/caikaidev/ai-newspaper.git
cd ai-newspaper
npm install
```

> `web/scripts/download-fonts.sh` is now optional. The production OG route no longer depends on local custom font files to function.

### Fetch your first edition

```bash
npm run fetch
```

By default, editions are written to `./data/editions`, which is intended to be committed to the repo for Vercel-friendly deployments.

If no explicit API key is configured, the skill tries the local OpenClaw runtime/CLI so it can reuse your existing OpenClaw provider setup. Only after that does it fall back to deterministic local scoring.

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

## SEO Foundation

The app now includes a first SEO foundation layer:

- `robots.txt` via `web/app/robots.ts`
- `sitemap.xml` via `web/app/sitemap.ts`
- unified canonical + alternates metadata via `web/lib/seo.ts`

Current sitemap coverage includes:
- `/`
- `/skills`
- `/skills/archive`
- `/archive`
- `/topics/skills`
- `/weekly/[week]`
- `/{date}`
- `/skills/{date}`

Additional SEO follow-up work is tracked in:
- `SEO-TODO.md`

### Weekly roundups

The app now also includes weekly roundup routes:
- `/weekly/[week]`

Weekly pages:
- deduplicate repeated stories within the same week
- preserve repeat-signal by showing how many times an item surfaced that week
- link back to the daily editions where that item appeared

### Structured data

The app now emits lightweight JSON-LD for core search-facing routes via `web/lib/structured-data.ts`:
- `CollectionPage`
- `BreadcrumbList`
- representative `Article` / `ItemList` style entities

Currently applied to:
- `/{date}`
- `/archive`
- `/topics/skills`
- `/weekly/[week]`

### SEO-aware secondary headings

The app now keeps the editorial-style primary newspaper headings, while adding clearer supporting secondary copy on key SEO-facing pages such as:
- `/skills`
- `/skills/archive`
- `/topics/skills`
- `/weekly/[week]`
- `/archive`

This keeps the retro tone intact while making each page's search-facing purpose more explicit.

### Canonical and alternates

The app keeps the current shared-route bilingual architecture (no `/en/...` or `/zh/...` path split), while metadata now consistently emits:
- canonical URLs for core routes
- `alternates.languages.en`
- `alternates.languages.zh-CN`
- `alternates.languages.x-default`

All alternates currently point to the same route, which matches the cookie + `Accept-Language` based rendering model without changing URL structure.

## Source Configuration

The project now supports a configurable source list through:

- `newspaper.config.json`

You can currently configure:
- whether Hacker News is enabled
- whether Reddit is enabled
- whether GitHub Trending is enabled
- whether AI Skills Radar is enabled
- which subreddits are fetched
- how Reddit stories are grouped on the edition page
- how AI Skills Radar cards are grouped on the edition page
- how many top skills are shown in the radar
- how many detail pages are fetched from `skills.sh`
- how many leaderboard entries are pulled from `claudeskills.club`

Default config example (synced from `newspaper.config.json`):

<!-- CONFIG_SNIPPET:START -->

```json
{
  "sources": {
    "hackernews": {
      "enabled": true,
      "label": {
        "en": "Hacker News",
        "zh": "Hacker News"
      }
    },
    "reddit": {
      "enabled": true,
      "label": {
        "en": "Reddit",
        "zh": "Reddit"
      },
      "subreddits": [
        "programming",
        "MachineLearning",
        "webdev",
        "devops"
      ],
      "groups": [
        {
          "key": "programming",
          "label": {
            "en": "Programming",
            "zh": "编程"
          },
          "match": [
            "programming"
          ]
        },
        {
          "key": "ml",
          "label": {
            "en": "Machine Learning",
            "zh": "机器学习"
          },
          "match": [
            "MachineLearning"
          ]
        },
        {
          "key": "web-devops",
          "label": {
            "en": "Web & DevOps",
            "zh": "Web 与 DevOps"
          },
          "match": [
            "webdev",
            "devops"
          ]
        }
      ]
    },
    "github": {
      "enabled": true,
      "label": {
        "en": "GitHub Trending",
        "zh": "GitHub 热门趋势"
      }
    },
    "skills": {
      "enabled": true,
      "label": {
        "en": "AI Skills Radar",
        "zh": "AI Skills 雷达"
      },
      "topN": 9,
      "detailFetchLimit": 6,
      "claudeSkillsTopN": 6,
      "groups": [
        {
          "key": "leaders",
          "label": {
            "en": "Most Installed",
            "zh": "安装量领先"
          },
          "slice": [
            0,
            3
          ]
        },
        {
          "key": "watchlist",
          "label": {
            "en": "Radar Watchlist",
            "zh": "雷达观察"
          },
          "slice": [
            3,
            6
          ]
        },
        {
          "key": "editors-pick",
          "label": {
            "en": "Editors' Picks",
            "zh": "编辑精选"
          },
          "slice": [
            6,
            9
          ]
        }
      ]
    }
  }
}
```

<!-- CONFIG_SNIPPET:END -->

To resync this README snippet after editing the config:

```bash
npm run docs:sync-config
```

## AI Skills Radar

The app now includes a dedicated **AI Skills Radar** built from multiple skills discovery sources.

### Current skills sources

- `skills.sh`
- `claudeskills.club`

### Radar behavior

- The homepage edition shows a compact **AI Skills Radar** section
- The full radar is also available on dedicated routes:
  - `/skills` → latest skills radar hub
  - `/skills/archive` → dedicated skills archive index
  - `/skills/YYYY-MM-DD` → dated skills radar
  - `/archive` → historical edition archive
  - `/topics/skills` → skills topic hub
- Radar display count is intentionally capped to avoid visual overload
- Skills are deduplicated across sources
- A light diversity rule prevents one source from fully dominating the radar
- Skills are currently **not mixed into the main front page ranking**; they remain a special section

### Navigation

- Main edition pages link to `/skills`, `/topics/skills`, and `/archive`
- Skills pages link back to the matching main edition date page, `/skills/archive`, `/topics/skills`, and `/archive`
- `/archive` links each date to both the main edition and the matching skills radar page
- `/topics/skills` acts as a thematic hub linking recent picks to radar pages and full editions
- Skills pages use the same date navigation pattern as the main edition

## Localization

The app now supports **English** and **Simplified Chinese**.

### Language behavior

- On first visit, the UI checks the browser's `Accept-Language`
- If the browser prefers Chinese, the default UI language is **Simplified Chinese**
- All other browsers default to **English**
- Manual language switching is supported and persisted via cookie

### What is localized

- Site UI chrome (masthead, navigation, onboarding, section labels, footer, etc.)
- AI-generated headlines and summaries
- Config-driven source labels, Reddit groups, and AI Skills Radar labels

### Data model

New editions now store bilingual content fields:

- `retro_headline` / `retro_summary` → English
- `retro_headline_zh` / `retro_summary_zh` → Simplified Chinese

Older editions without Chinese fields automatically fall back to English.

## Production deployment: VPS + OpenClaw cron + Vercel

This repo is now structured primarily for:
- `web/` deploys to Vercel
- `data/editions/` is committed into git
- a VPS runs OpenClaw cron, which generates fresh editions locally and pushes them back to GitHub

### Live deployment

Current production URL:
- `https://ai-newspaper-web.vercel.app`

Verified routes:
- `/`
- `/feed.xml`
- `/api/og?date=YYYY-MM-DD`
- `/skills`
- `/skills/YYYY-MM-DD`
- `/archive`
- `/skills/archive`
- `/topics/skills`
- `/robots.txt`
- `/sitemap.xml`

Recommended `NEWSPAPER_BASE_URL` value:
- `https://ai-newspaper-web.vercel.app`

### Recommended Vercel settings

- **Framework Preset:** Next.js
- **Root Directory:** `web`
- **Build Command:** `npm run build --workspace=web`
- **Install Command:** `npm install`
- **Output Directory:** leave default for Next.js

### Recommended VPS flow

Use the helper script:

```bash
./scripts/publish-edition.sh
```

What it does:
- verifies the repo is clean before publishing
- fetches/rebases from `origin/<current-branch>` before generating
- runs `npm run fetch:force`
- updates `data/editions`
- commits changes if needed
- pushes to the current branch on GitHub
- writes a timestamped log file under `logs/`
- uses a lock file under `.locks/` to avoid overlapping runs

### OpenClaw cron

Recommended cron job name:
- `ai-newspaper:publish`

Typical schedule:
- daily around `07:05 UTC`

The cron job should run an agent turn that executes the publish script from the repo.

### Optional GitHub Actions

A workflow file is still included at:
- `.github/workflows/daily-fetch.yml`

Use it only if you later add cloud-side AI credentials. If you rely on local OpenClaw AI/OAuth on the VPS, the VPS cron path should be your primary publisher.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `NEWSPAPER_DATA_DIR` | `./data/editions` for fetch, `../data/editions` for web | Where edition JSON files are stored |
| `NEWSPAPER_BASE_URL` | `http://localhost:3000` | Canonical URL for RSS links, sitemap URLs, and OG image links; set this to `https://ai-newspaper-web.vercel.app` in production |
| `ANTHROPIC_API_KEY` | — | API key for standalone mode |
| `OPENCLAW_BIN` | `openclaw` | Override the OpenClaw CLI path used for gateway-backed AI fallback |
| `OPENCLAW_AI_AGENT_ID` | `general_agent` | Which OpenClaw agent to invoke for CLI-backed AI scoring |

## Notes on source reliability

- Hacker News and GitHub Trending should work without credentials.
- Reddit's anonymous `.json` endpoints may return `403 Blocked` from some hosts or IP ranges. The pipeline automatically falls back to Reddit's public RSS feeds so editions can still include Reddit stories when JSON is blocked.
- Skills directories may change HTML structure over time; the radar fetchers should be treated as best-effort integrations and periodically revalidated.

## Schedule

For VPS deployment, the recommended schedule is a daily OpenClaw cron run at **07:05 UTC**.

## Troubleshooting

### Cron job did not run

Check scheduler status and jobs:

```bash
openclaw cron status
openclaw cron list
```

Run the job manually:

```bash
openclaw cron run <job-id>
```

### Publish script failed

Check the latest local logs:

```bash
ls -1 logs/
tail -n 200 logs/<latest-log-file>
```

Common causes:
- repo has uncommitted local changes
- `git push` credentials are broken
- OpenClaw gateway/provider is unavailable

### Vercel did not update

Check whether GitHub received a new commit:

```bash
git log --oneline -n 5
```

Then verify the deployed routes:
- `https://ai-newspaper-web.vercel.app/`
- `https://ai-newspaper-web.vercel.app/feed.xml`
- `https://ai-newspaper-web.vercel.app/api/og?date=YYYY-MM-DD`
- `https://ai-newspaper-web.vercel.app/skills`
- `https://ai-newspaper-web.vercel.app/archive`
- `https://ai-newspaper-web.vercel.app/skills/archive`
- `https://ai-newspaper-web.vercel.app/topics/skills`
- `https://ai-newspaper-web.vercel.app/robots.txt`
- `https://ai-newspaper-web.vercel.app/sitemap.xml`

### RSS links show localhost

Re-run the publish flow with the correct base URL:

```bash
NEWSPAPER_BASE_URL=https://ai-newspaper-web.vercel.app ./scripts/publish-edition.sh
```

### OG route fails

First verify edition data exists for that date, then check the API route:
- `/api/edition?date=YYYY-MM-DD`
- `/api/og?date=YYYY-MM-DD`

### Language does not switch

The site stores language preference in a cookie. If switching appears stuck:
- click the language switcher again
- refresh the page
- clear site cookies and retry

For first-visit behavior, Chinese browsers should default to Simplified Chinese; all others default to English.

### Skills Radar looks sparse or outdated

Check whether skills sources are enabled and whether fetchers still match current source markup:
- `newspaper.config.json`
- `skill/lib/fetchers/skills.ts`
- `skill/lib/fetchers/claude-skills.ts`

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
    "github": [...],
    "skills": [...]
  }
}
```

## Features

- 🗞 Vintage 1920s broadsheet aesthetic
- 🤖 AI-scored and rewritten headlines in period journalistic style
- 🌐 English / Simplified Chinese UI localization
- 🈶 Bilingual generated headlines and summaries for new editions
- ⚙ Configurable source list via `newspaper.config.json`
- 🧭 AI Skills Radar section powered by `skills.sh` + `claudeskills.club`
- 📄 Dedicated `/skills` and `/skills/[date]` radar pages
- 🤖 Basic SEO foundation with `robots.txt` and `sitemap.xml`
- 🪝 OpenClaw gateway/CLI-backed AI fallback using your existing provider auth
- 🧪 Deterministic fallback scoring when no live AI provider is configured anywhere
- 📻 RSS feed (`/feed.xml`) with last 14 editions
- 🖼 OG image generation (`/api/og?date=YYYY-MM-DD`) for social sharing
- 🖨 Print stylesheet for real broadsheet printing
- 📱 Responsive — 3-col desktop, 2-col tablet, single-col mobile
- 🔄 Run manifest for idempotent retries
- 🔔 Staleness banner when pipeline hasn't run in >1 day
- 🚀 Vercel-friendly repo data layout via `data/editions`
- ⏰ VPS-friendly publishing via `scripts/publish-edition.sh` + OpenClaw cron

## Deferred (see TODOS.md)

- SQLite edition index for full-text search
- Dark mode / Evening Edition
- Customizable source list for additional source modes and richer overrides
- Dedicated `/skills` historical analytics / trends view
- "This day in tech history" sidebar (after 365+ editions)

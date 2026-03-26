# The Daily Byte

A retro-style newspaper web app that aggregates daily content from Hacker News, Reddit, and GitHub Trending, scores it with AI, and renders everything in a vintage 1920s broadsheet aesthetic.

## Architecture

```
OpenClaw cron on VPS                     Next.js Web App (Vercel)
────────────────────────────            ─────────────────────────
run publish-edition.sh                  reads repo data/editions
          ↓                                          ↓
fetch HN + Reddit + GitHub              app/page.tsx → redirect
          ↓                             app/[date]/page.tsx → render
AI scoring via local OpenClaw           app/api/og → OG image route
          ↓                             app/feed.xml → RSS route
  data/editions/YYYY-MM-DD.json
  data/editions/feed.xml
  data/editions/run.log.json
          ↓
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

## Source Configuration

The project now supports a configurable source list through:

- `newspaper.config.json`

You can currently configure:
- whether Hacker News is enabled
- whether Reddit is enabled
- whether GitHub Trending is enabled
- which subreddits are fetched
- how Reddit stories are grouped on the edition page

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
    }
  }
}
```

<!-- CONFIG_SNIPPET:END -->

To resync this README snippet after editing the config:

```bash
npm run docs:sync-config
```

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
- Config-driven source labels and Reddit group labels

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
| `NEWSPAPER_BASE_URL` | `http://localhost:3000` | Canonical URL for RSS links and OG image links; set this to `https://ai-newspaper-web.vercel.app` in production |
| `ANTHROPIC_API_KEY` | — | API key for standalone mode |
| `OPENCLAW_BIN` | `openclaw` | Override the OpenClaw CLI path used for gateway-backed AI fallback |
| `OPENCLAW_AI_AGENT_ID` | `general_agent` | Which OpenClaw agent to invoke for CLI-backed AI scoring |

## Notes on source reliability

- Hacker News and GitHub Trending should work without credentials.
- Reddit's anonymous `.json` endpoints may return `403 Blocked` from some hosts or IP ranges. The pipeline automatically falls back to Reddit's public RSS feeds so editions can still include Reddit stories when JSON is blocked.

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

- 🗞 Vintage 1920s broadsheet aesthetic
- 🤖 AI-scored and rewritten headlines in period journalistic style
- 🌐 English / Simplified Chinese UI localization
- 🈶 Bilingual generated headlines and summaries for new editions
- ⚙ Configurable source list via `newspaper.config.json`
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
- "This day in tech history" sidebar (after 365+ editions)

import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { labelForLang, loadConfig } from '@/lib/config'

const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'http://localhost:3000'

export function getBaseUrl(): string {
  return BASE_URL
}

export function homeMetadata(lang: AppLang) {
  const m = t(lang)
  return {
    title: `${m.siteName} — Daily AI-Curated Tech & Skills Radar`,
    description: m.siteDescription,
  }
}

export function editionMetadata(date: string, heroHeadline: string | undefined, heroSummary: string | undefined, lang: AppLang) {
  const m = t(lang)
  return {
    title: `${date} Tech Edition — ${m.siteName}`,
    description: heroSummary ?? `${m.siteName} for ${date}: daily AI-curated tech headlines, open-source projects, community discussions, and skills radar.`,
    openGraph: {
      title: heroHeadline ? `${heroHeadline} — ${m.siteName}` : `${m.siteName} — ${date}`,
      description: heroSummary ?? m.siteDescription,
      images: [`${BASE_URL}/api/og?date=${date}`],
    },
    alternates: {
      canonical: `${BASE_URL}/${date}`,
    },
  }
}

export function skillsHubMetadata(lang: AppLang) {
  const m = t(lang)
  const config = loadConfig()
  const skillsLabel = labelForLang(config.sources.skills.label, lang)
  return {
    title: `${skillsLabel} — ${m.siteName}`,
    description: `${skillsLabel}: a curated daily radar of AI skills, ranked across multiple skill directories.`,
    alternates: {
      canonical: `${BASE_URL}/skills`,
    },
  }
}

export function skillsEditionMetadata(date: string, lang: AppLang) {
  const m = t(lang)
  const config = loadConfig()
  const skillsLabel = labelForLang(config.sources.skills.label, lang)
  return {
    title: `${skillsLabel} for ${date} — ${m.siteName}`,
    description: `${skillsLabel} for ${date}: ranked AI skills, installation signals, and editorial summaries across tracked skills sources.`,
    alternates: {
      canonical: `${BASE_URL}/skills/${date}`,
    },
  }
}

export function archiveMetadata(lang: AppLang) {
  const m = t(lang)
  return {
    title: `${m.archivePage} — ${m.siteName}`,
    description: `${m.archivePage}: browse past daily editions and their matching AI Skills Radar pages in one place.`,
    alternates: {
      canonical: `${BASE_URL}/archive`,
    },
  }
}

export function topicSkillsMetadata(lang: AppLang) {
  const m = t(lang)
  return {
    title: `${m.skillsTopicPage} — ${m.siteName}`,
    description: `${m.skillsTopicPage}: a topic hub for recent AI skills picks, radar editions, and archive paths across The Daily Byte.`,
    alternates: {
      canonical: `${BASE_URL}/topics/skills`,
    },
  }
}

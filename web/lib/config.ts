import rootConfig from '../../newspaper.config.json'
import type { AppLang } from '@/lib/i18n'

export type LocalizedLabel = {
  en: string
  zh: string
}

export type RedditGroup = {
  key: string
  label: LocalizedLabel
  match: string[]
}

export type SkillsGroup = {
  key: string
  label: LocalizedLabel
  slice: [number, number]
}

export type NewspaperConfig = {
  sources: {
    hackernews: {
      enabled: boolean
      label: LocalizedLabel
    }
    reddit: {
      enabled: boolean
      label: LocalizedLabel
      subreddits: string[]
      groups: RedditGroup[]
    }
    github: {
      enabled: boolean
      label: LocalizedLabel
    }
    skills: {
      enabled: boolean
      label: LocalizedLabel
      topN: number
      detailFetchLimit: number
      groups: SkillsGroup[]
    }
  }
}

export function loadConfig(): NewspaperConfig {
  return rootConfig as NewspaperConfig
}

export function labelForLang(label: { en: string; zh: string }, lang: AppLang): string {
  return lang === 'zh-CN' ? label.zh : label.en
}

import rootConfig from '../../newspaper.config.json'

export type LocalizedLabel = {
  en: string
  zh: string
}

export type RedditGroup = {
  key: string
  label: LocalizedLabel
  match: string[]
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
  }
}

export function loadConfig(): NewspaperConfig {
  return rootConfig as NewspaperConfig
}

export interface RawItem {
  id: string
  source: 'hackernews' | 'reddit' | 'github' | 'skills'
  title: string
  url: string
  points?: number
  comments?: number
  repo?: string
  stars?: number
  subreddit?: string
  owner?: string
  installs?: number
  skill_rank?: number
  source_label?: string
  summary?: string
}

export interface ScoredItem extends RawItem {
  ai_score: number
  retro_headline: string
  retro_summary: string
  retro_headline_zh?: string
  retro_summary_zh?: string
}

export interface WeeklyItem extends ScoredItem {
  weekly_count: number
  weekly_dates: string[]
}

export interface Edition {
  schema_version: number
  date: string
  edition: number
  generated_at: string
  front_page: ScoredItem[]
  sections: {
    hackernews: ScoredItem[]
    reddit: ScoredItem[]
    github: ScoredItem[]
    skills: ScoredItem[]
  }
}

export interface RunLogEntry {
  date: string
  started_at: string
  duration_ms: number
  hn_count: number
  reddit_count: number
  github_count: number
  skills_count?: number
  total_before_dedup: number
  total_after_dedup: number
  status: 'ok' | 'partial' | 'error'
  error?: string
}

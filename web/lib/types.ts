export interface RawItem {
  id: string
  source: 'hackernews' | 'reddit' | 'github'
  title: string
  url: string
  points?: number
  comments?: number
  repo?: string
  stars?: number
  subreddit?: string
}

export interface ScoredItem extends RawItem {
  ai_score: number
  retro_headline: string
  retro_summary: string
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
  }
}

export interface RunLogEntry {
  date: string
  started_at: string
  duration_ms: number
  hn_count: number
  reddit_count: number
  github_count: number
  total_before_dedup: number
  total_after_dedup: number
  status: 'ok' | 'partial' | 'error'
  error?: string
}

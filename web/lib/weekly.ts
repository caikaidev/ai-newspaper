import { listEditions, loadEdition } from '@/lib/editions'
import type { Edition, ScoredItem, WeeklyItem } from '@/lib/types'

function toWeekId(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function listWeeks(): string[] {
  const weeks = new Set<string>()
  for (const date of listEditions()) {
    weeks.add(toWeekId(new Date(`${date}T00:00:00Z`)))
  }
  return Array.from(weeks).sort().reverse()
}

export function listEditionDatesForWeek(week: string): string[] {
  return listEditions().filter(date => toWeekId(new Date(`${date}T00:00:00Z`)) === week).sort().reverse()
}

function weeklyKey(item: ScoredItem): string {
  return item.url || item.id
}

function chooseBetterItem(current: WeeklyItem, candidate: ScoredItem, candidateDate: string): WeeklyItem {
  const currentLatestDate = current.weekly_dates.slice().sort().reverse()[0] ?? ''
  if (candidate.ai_score > current.ai_score) {
    return {
      ...candidate,
      weekly_count: current.weekly_count,
      weekly_dates: current.weekly_dates,
    }
  }
  if (candidate.ai_score === current.ai_score && candidateDate > currentLatestDate) {
    return {
      ...candidate,
      weekly_count: current.weekly_count,
      weekly_dates: current.weekly_dates,
    }
  }
  return current
}

export function buildWeeklyEdition(week: string): {
  week: string
  dates: string[]
  items: WeeklyItem[]
  editions: Edition[]
} | null {
  const dates = listEditionDatesForWeek(week)
  if (dates.length === 0) return null

  const editions = dates
    .map(date => loadEdition(date))
    .filter((edition): edition is Edition => Boolean(edition))

  const map = new Map<string, WeeklyItem>()

  for (const edition of editions) {
    for (const item of edition.front_page) {
      const key = weeklyKey(item)
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          ...item,
          weekly_count: 1,
          weekly_dates: [edition.date],
        })
        continue
      }

      const mergedDates = Array.from(new Set([...existing.weekly_dates, edition.date])).sort().reverse()
      const better = chooseBetterItem(existing, item, edition.date)
      map.set(key, {
        ...better,
        weekly_count: mergedDates.length,
        weekly_dates: mergedDates,
      })
    }
  }

  const items = Array.from(map.values()).sort((a, b) => {
    if (b.weekly_count !== a.weekly_count) return b.weekly_count - a.weekly_count
    if (b.ai_score !== a.ai_score) return b.ai_score - a.ai_score
    return (b.weekly_dates[0] ?? '').localeCompare(a.weekly_dates[0] ?? '')
  })

  return {
    week,
    dates,
    items,
    editions,
  }
}

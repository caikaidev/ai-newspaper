import fs from 'fs'
import path from 'path'
import type { RunLogEntry } from './types'
import { resolveEditionsDir } from './editions'

export function loadRunLog(): RunLogEntry[] {
  const p = path.join(resolveEditionsDir(), 'run.log.json')
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as RunLogEntry[]
  } catch {
    return []
  }
}

/** Returns number of days since the most recent successful run, or null if no log. */
export function daysSinceLastRun(): number | null {
  const log = loadRunLog()
  if (log.length === 0) return null
  const lastDate = new Date(log[0].date)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

import fs from 'fs'
import path from 'path'
import type { RunLogEntry } from './types.js'

const MAX_ENTRIES = 14

export function runLogPath(editionsDir: string): string {
  return path.join(editionsDir, 'run.log.json')
}

export function appendRunLog(editionsDir: string, entry: RunLogEntry): void {
  const p = runLogPath(editionsDir)
  let entries: RunLogEntry[] = []
  try {
    entries = JSON.parse(fs.readFileSync(p, 'utf-8')) as RunLogEntry[]
  } catch {
    // first run
  }
  entries.unshift(entry)
  if (entries.length > MAX_ENTRIES) entries = entries.slice(0, MAX_ENTRIES)
  fs.writeFileSync(p, JSON.stringify(entries, null, 2))
}

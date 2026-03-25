import fs from 'fs'
import path from 'path'
import type { RunManifest } from './types.js'

export function manifestPath(editionsDir: string, date: string): string {
  return path.join(editionsDir, `${date}.manifest.json`)
}

export function loadManifest(editionsDir: string, date: string): RunManifest | null {
  const p = manifestPath(editionsDir, date)
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as RunManifest
  } catch {
    return null
  }
}

export function updateManifest(
  editionsDir: string,
  date: string,
  patch: Partial<RunManifest>
): RunManifest {
  const existing = loadManifest(editionsDir, date) ?? {
    date,
    json_written: false,
    feed_updated: false,
    channel_sent: false,
  }
  const updated: RunManifest = { ...existing, ...patch }

  if (updated.json_written && updated.feed_updated && updated.channel_sent) {
    updated.completed_at = new Date().toISOString()
  }

  fs.writeFileSync(manifestPath(editionsDir, date), JSON.stringify(updated, null, 2))
  return updated
}

export function isComplete(manifest: RunManifest | null): boolean {
  return !!(manifest?.json_written && manifest.feed_updated && manifest.channel_sent)
}

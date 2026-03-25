import fs from 'fs'
import path from 'path'
import type { Edition } from './types'

const DATE_RE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

export function resolveEditionsDir(): string {
  return (
    process.env.NEWSPAPER_DATA_DIR ??
    path.resolve(process.cwd(), '..', 'data', 'editions')
  )
}

/**
 * Returns sorted date strings newest-first.
 * Returns [] if dir is empty or missing — never throws.
 */
export function listEditions(): string[] {
  const dir = resolveEditionsDir()
  try {
    return fs
      .readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map(f => f.replace('.json', ''))
      .sort()
      .reverse()
  } catch {
    return []
  }
}

/**
 * Returns Edition for a given date, or null if not found / invalid date.
 * Throws on malformed JSON (unexpected error).
 */
export function loadEdition(date: string): Edition | null {
  if (!DATE_RE.test(date)) return null

  const dir = resolveEditionsDir()
  const filePath = path.join(dir, `${date}.json`)

  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf-8')
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }

  const parsed = JSON.parse(raw) as Partial<Edition>

  // Normalize pre-v1 editions missing schema_version
  if (!parsed.schema_version) {
    return { schema_version: 0, ...parsed } as Edition
  }

  return parsed as Edition
}

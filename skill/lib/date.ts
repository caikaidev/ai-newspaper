export const EDITION_TZ = 'UTC'

/** Returns today's date as YYYY-MM-DD in UTC. */
export function todayEditionDate(): string {
  return new Date().toISOString().slice(0, 10)
}

import { describe, it, expect } from 'vitest'
import { todayEditionDate } from '../lib/date.js'

describe('todayEditionDate', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayEditionDate()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns a UTC-based date matching toISOString slice', () => {
    const result = todayEditionDate()
    const expected = new Date().toISOString().slice(0, 10)
    expect(result).toBe(expected)
  })
})

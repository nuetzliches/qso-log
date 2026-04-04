import { describe, it, expect } from 'vitest'
import { formatUtcDate, formatUtcTime, formatUtcDateTime, toIsoString, formatDateForAdif, formatTimeForAdif } from '../../../src/utils/dateTime'

describe('formatUtcDate', () => {
  it('extracts date from ISO string', () => {
    expect(formatUtcDate('2024-03-15T14:30:00.000Z')).toBe('2024-03-15')
  })
})

describe('formatUtcTime', () => {
  it('extracts HH:MM from ISO string', () => {
    expect(formatUtcTime('2024-03-15T14:30:00.000Z')).toBe('14:30')
  })
})

describe('formatUtcDateTime', () => {
  it('combines date and time', () => {
    expect(formatUtcDateTime('2024-03-15T14:30:00.000Z')).toBe('2024-03-15 14:30')
  })
})

describe('toIsoString', () => {
  it('combines date and time into ISO string', () => {
    expect(toIsoString('2024-03-15', '14:30')).toBe('2024-03-15T14:30:00.000Z')
  })
})

describe('formatDateForAdif', () => {
  it('formats date as YYYYMMDD', () => {
    expect(formatDateForAdif('2024-03-15T14:30:00.000Z')).toBe('20240315')
  })
})

describe('formatTimeForAdif', () => {
  it('formats time as HHMM', () => {
    expect(formatTimeForAdif('2024-03-15T14:30:00.000Z')).toBe('1430')
  })

  it('pads single-digit hours', () => {
    expect(formatTimeForAdif('2024-03-15T03:05:00.000Z')).toBe('0305')
  })
})

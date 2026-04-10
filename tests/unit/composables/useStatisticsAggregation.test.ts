import { describe, it, expect } from 'vitest'
import type { QSO } from '../../../src/types/qso'
import {
  aggregateByBand,
  aggregateByMode,
  aggregateByBandAndMode,
  sortBands,
  topEntry,
  aggregateByDay,
  aggregateByWeek,
  aggregateByMonth,
  calculateStreaks,
  findMostActiveDay,
  countQsosInPeriod,
  aggregateByCountry,
  countUniqueDxcc,
  calculateDistanceStats,
  getDistanceBuckets,
  getTopDistances,
} from '../../../src/composables/useStatisticsAggregation'

function createTestQso(overrides: Partial<QSO> = {}): QSO {
  return {
    id: 1,
    uuid: 'test-uuid',
    sequenceNumber: 1,
    date: '2025-03-15T14:30:00Z',
    callsign: 'DL1ABC',
    mode: 'SSB',
    power: '100',
    frequency: '14.200',
    band: '20m',
    rstSent: '59',
    rstReceived: '59',
    remarks: '',
    qslSent: 'no',
    qslReceived: 'no',
    operatorId: 1,
    _lastModified: Date.now(),
    _syncStatus: 'pending',
    ...overrides,
  }
}

// ── Band/Mode ──────────────────────────────────────────────────────────

describe('aggregateByBand', () => {
  it('returns empty map for no QSOs', () => {
    expect(aggregateByBand([]).size).toBe(0)
  })

  it('counts QSOs per band', () => {
    const qsos = [
      createTestQso({ band: '20m' }),
      createTestQso({ band: '20m' }),
      createTestQso({ band: '40m' }),
    ]
    const result = aggregateByBand(qsos)
    expect(result.get('20m')).toBe(2)
    expect(result.get('40m')).toBe(1)
  })
})

describe('aggregateByMode', () => {
  it('counts QSOs per mode', () => {
    const qsos = [
      createTestQso({ mode: 'FT8' }),
      createTestQso({ mode: 'FT8' }),
      createTestQso({ mode: 'SSB' }),
    ]
    const result = aggregateByMode(qsos)
    expect(result.get('FT8')).toBe(2)
    expect(result.get('SSB')).toBe(1)
  })
})

describe('aggregateByBandAndMode', () => {
  it('groups by band and mode', () => {
    const qsos = [
      createTestQso({ band: '20m', mode: 'FT8' }),
      createTestQso({ band: '20m', mode: 'SSB' }),
      createTestQso({ band: '20m', mode: 'FT8' }),
      createTestQso({ band: '40m', mode: 'CW' }),
    ]
    const result = aggregateByBandAndMode(qsos)
    expect(result.get('20m')?.get('FT8')).toBe(2)
    expect(result.get('20m')?.get('SSB')).toBe(1)
    expect(result.get('40m')?.get('CW')).toBe(1)
  })
})

describe('sortBands', () => {
  it('sorts bands by frequency order', () => {
    const result = sortBands(['10m', '160m', '20m', '40m'])
    expect(result).toEqual(['160m', '40m', '20m', '10m'])
  })

  it('puts unknown bands at end', () => {
    const result = sortBands(['20m', 'unknown'])
    expect(result[result.length - 1]).toBe('unknown')
  })
})

describe('topEntry', () => {
  it('returns null for empty map', () => {
    expect(topEntry(new Map())).toBeNull()
  })

  it('returns highest count entry', () => {
    const map = new Map([['a', 3], ['b', 7], ['c', 1]])
    expect(topEntry(map)).toEqual({ key: 'b', count: 7 })
  })
})

// ── Activity ───────────────────────────────────────────────────────────

describe('aggregateByDay', () => {
  it('groups by date', () => {
    const qsos = [
      createTestQso({ date: '2025-03-15T10:00:00Z' }),
      createTestQso({ date: '2025-03-15T14:00:00Z' }),
      createTestQso({ date: '2025-03-16T09:00:00Z' }),
    ]
    const result = aggregateByDay(qsos)
    expect(result.get('2025-03-15')).toBe(2)
    expect(result.get('2025-03-16')).toBe(1)
  })
})

describe('aggregateByMonth', () => {
  it('groups by year-month', () => {
    const qsos = [
      createTestQso({ date: '2025-03-15T10:00:00Z' }),
      createTestQso({ date: '2025-03-20T10:00:00Z' }),
      createTestQso({ date: '2025-04-01T10:00:00Z' }),
    ]
    const result = aggregateByMonth(qsos)
    expect(result.get('2025-03')).toBe(2)
    expect(result.get('2025-04')).toBe(1)
  })
})

describe('calculateStreaks', () => {
  it('returns zeros for empty array', () => {
    const result = calculateStreaks([])
    expect(result.longest).toBe(0)
    expect(result.current).toBe(0)
  })

  it('calculates longest streak', () => {
    const qsos = [
      createTestQso({ date: '2025-01-01T10:00:00Z' }),
      createTestQso({ date: '2025-01-02T10:00:00Z' }),
      createTestQso({ date: '2025-01-03T10:00:00Z' }),
      // gap
      createTestQso({ date: '2025-01-10T10:00:00Z' }),
      createTestQso({ date: '2025-01-11T10:00:00Z' }),
    ]
    const result = calculateStreaks(qsos)
    expect(result.longest).toBe(3)
    expect(result.longestStart).toBe('2025-01-01')
  })

  it('handles single day', () => {
    const qsos = [createTestQso({ date: '2025-06-15T10:00:00Z' })]
    const result = calculateStreaks(qsos)
    expect(result.longest).toBe(1)
  })
})

describe('findMostActiveDay', () => {
  it('returns null for empty array', () => {
    expect(findMostActiveDay([])).toBeNull()
  })

  it('finds the day with most QSOs', () => {
    const qsos = [
      createTestQso({ date: '2025-03-15T10:00:00Z' }),
      createTestQso({ date: '2025-03-15T14:00:00Z' }),
      createTestQso({ date: '2025-03-15T16:00:00Z' }),
      createTestQso({ date: '2025-03-16T09:00:00Z' }),
    ]
    const result = findMostActiveDay(qsos)
    expect(result?.date).toBe('2025-03-15')
    expect(result?.count).toBe(3)
  })
})

describe('countQsosInPeriod', () => {
  it('counts QSOs from start date', () => {
    const qsos = [
      createTestQso({ date: '2025-01-01T10:00:00Z' }),
      createTestQso({ date: '2025-06-15T10:00:00Z' }),
      createTestQso({ date: '2025-09-20T10:00:00Z' }),
    ]
    expect(countQsosInPeriod(qsos, '2025-06-01')).toBe(2)
  })
})

// ── DXCC ───────────────────────────────────────────────────────────────

describe('aggregateByCountry', () => {
  it('returns empty for no QSOs', () => {
    expect(aggregateByCountry([])).toEqual([])
  })

  it('groups by country from QSO field', () => {
    const qsos = [
      createTestQso({ country: 'Germany', countryCode: 'DE' }),
      createTestQso({ country: 'Germany', countryCode: 'DE' }),
      createTestQso({ country: 'France', countryCode: 'FR' }),
    ]
    const result = aggregateByCountry(qsos)
    expect(result[0].country).toBe('Germany')
    expect(result[0].count).toBe(2)
    expect(result[1].country).toBe('France')
    expect(result[1].count).toBe(1)
  })

  it('falls back to callsign lookup', () => {
    const qsos = [createTestQso({ callsign: 'DL1ABC', country: undefined })]
    const result = aggregateByCountry(qsos)
    expect(result.length).toBe(1)
    expect(result[0].country).toBe('Germany')
  })
})

describe('countUniqueDxcc', () => {
  it('counts unique countries', () => {
    const qsos = [
      createTestQso({ country: 'Germany' }),
      createTestQso({ country: 'Germany' }),
      createTestQso({ country: 'France' }),
    ]
    expect(countUniqueDxcc(qsos)).toBe(2)
  })
})

// ── Distance ───────────────────────────────────────────────────────────

describe('calculateDistanceStats', () => {
  it('handles empty array', () => {
    const result = calculateDistanceStats([], 'JN47ao')
    expect(result.farthest).toBeNull()
    expect(result.average).toBe(0)
    expect(result.withLocator).toBe(0)
  })

  it('calculates stats with valid locators', () => {
    const qsos = [
      createTestQso({ locator: 'JO31fu', callsign: 'PA3ABC' }),
      createTestQso({ locator: 'IO91wm', callsign: 'G4XYZ' }),
    ]
    const result = calculateDistanceStats(qsos, 'JN47ao')
    expect(result.withLocator).toBe(2)
    expect(result.farthest).not.toBeNull()
    expect(result.farthest!.distance).toBeGreaterThan(0)
    expect(result.average).toBeGreaterThan(0)
  })

  it('counts QSOs without locator', () => {
    const qsos = [
      createTestQso({ locator: 'JO31fu' }),
      createTestQso({ locator: undefined }),
    ]
    const result = calculateDistanceStats(qsos, 'JN47ao')
    expect(result.withoutLocator).toBe(1)
  })

  it('tracks unique grid squares', () => {
    const qsos = [
      createTestQso({ locator: 'JO31fu' }),
      createTestQso({ locator: 'JO31ab' }),
      createTestQso({ locator: 'IO91wm' }),
    ]
    const result = calculateDistanceStats(qsos, 'JN47ao')
    expect(result.uniqueGridSquares).toBe(2) // JO31 and IO91
  })
})

describe('getDistanceBuckets', () => {
  it('returns all bucket keys even if empty', () => {
    const result = getDistanceBuckets([], 'JN47ao')
    expect(result.size).toBe(6)
  })
})

describe('getTopDistances', () => {
  it('returns sorted by distance descending', () => {
    const qsos = [
      createTestQso({ locator: 'JO31fu', callsign: 'PA3ABC' }),
      createTestQso({ locator: 'IO91wm', callsign: 'G4XYZ' }),
      createTestQso({ locator: 'FN20ai', callsign: 'W1AW' }),
    ]
    const result = getTopDistances(qsos, 'JN47ao', 10)
    expect(result.length).toBe(3)
    expect(result[0].distance).toBeGreaterThanOrEqual(result[1].distance)
    expect(result[1].distance).toBeGreaterThanOrEqual(result[2].distance)
  })

  it('respects limit', () => {
    const qsos = [
      createTestQso({ locator: 'JO31fu', callsign: 'PA3ABC' }),
      createTestQso({ locator: 'IO91wm', callsign: 'G4XYZ' }),
      createTestQso({ locator: 'FN20ai', callsign: 'W1AW' }),
    ]
    const result = getTopDistances(qsos, 'JN47ao', 2)
    expect(result.length).toBe(2)
  })
})

import { describe, it, expect } from 'vitest'
import {
  correlationByBand,
  kIndexBandMatrix,
  pearson,
  qsosWithPropagation,
  sfiDistancePairs,
} from '../../../src/composables/usePropagationAggregation'
import type { QSO } from '../../../src/types/qso'

function makeQso(overrides: Partial<QSO>): QSO {
  return {
    id: 1,
    uuid: 'u',
    sequenceNumber: 1,
    date: '2026-04-28T12:00:00Z',
    callsign: 'TEST',
    mode: 'SSB',
    power: '',
    frequency: '14.200',
    band: '20m',
    rstSent: '59',
    rstReceived: '59',
    remarks: '',
    qslSent: 'no',
    qslReceived: 'no',
    operatorId: 1,
    _lastModified: 0,
    _syncStatus: 'pending',
    ...overrides,
  }
}

describe('pearson', () => {
  it('returns 1 for perfect positive correlation', () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 5)
  })

  it('returns -1 for perfect negative correlation', () => {
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 5)
  })

  it('returns undefined for too few values', () => {
    expect(pearson([1], [2])).toBeUndefined()
  })

  it('returns undefined for constant series', () => {
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeUndefined()
  })

  it('handles mismatched lengths', () => {
    expect(pearson([1, 2], [1, 2, 3])).toBeUndefined()
  })
})

describe('qsosWithPropagation', () => {
  it('keeps only QSOs with propagation', () => {
    const qsos = [
      makeQso({ id: 1, propagation: { source: 'live', fetchedAt: '', sfi: 100 } }),
      makeQso({ id: 2 }),
    ]
    expect(qsosWithPropagation(qsos)).toHaveLength(1)
  })
})

describe('sfiDistancePairs', () => {
  it('returns empty when own locator is invalid', () => {
    const qsos = [makeQso({ propagation: { source: 'live', fetchedAt: '', sfi: 100 }, locator: 'JN47ao' })]
    expect(sfiDistancePairs(qsos, 'invalid')).toEqual([])
  })

  it('skips QSOs without sfi or locator', () => {
    const qsos = [
      makeQso({ id: 1, propagation: { source: 'live', fetchedAt: '', sfi: 100 } }), // no locator
      makeQso({ id: 2, locator: 'JO31de' }), // no propagation
      makeQso({ id: 3, propagation: { source: 'live', fetchedAt: '', sfi: 120 }, locator: 'JO31de', band: '40m' }),
    ]
    const pairs = sfiDistancePairs(qsos, 'JN47ao')
    expect(pairs).toHaveLength(1)
    expect(pairs[0].sfi).toBe(120)
    expect(pairs[0].band).toBe('40m')
  })
})

describe('kIndexBandMatrix', () => {
  it('groups counts by rounded K and band', () => {
    const qsos = [
      makeQso({ band: '20m', propagation: { source: 'live', fetchedAt: '', kIndex: 3 } }),
      makeQso({ band: '20m', propagation: { source: 'live', fetchedAt: '', kIndex: 3 } }),
      makeQso({ band: '40m', propagation: { source: 'live', fetchedAt: '', kIndex: 5 } }),
    ]
    const m = kIndexBandMatrix(qsos)
    expect(m.get(3)?.get('20m')).toBe(2)
    expect(m.get(5)?.get('40m')).toBe(1)
  })

  it('clamps K values into [0,9]', () => {
    const qsos = [
      makeQso({ band: '20m', propagation: { source: 'live', fetchedAt: '', kIndex: 12 } }),
    ]
    const m = kIndexBandMatrix(qsos)
    expect(m.get(9)?.get('20m')).toBe(1)
  })
})

describe('correlationByBand', () => {
  it('produces a row per band sorted by count desc', () => {
    const qsos = [
      makeQso({ id: 1, band: '20m', locator: 'JO31de', propagation: { source: 'live', fetchedAt: '', sfi: 100 } }),
      makeQso({ id: 2, band: '20m', locator: 'IN78fb', propagation: { source: 'live', fetchedAt: '', sfi: 150 } }),
      makeQso({ id: 3, band: '40m', locator: 'JO31de', propagation: { source: 'live', fetchedAt: '', sfi: 100 } }),
    ]
    const rows = correlationByBand(qsos, 'JN47ao')
    expect(rows[0].band).toBe('20m')
    expect(rows[0].count).toBe(2)
    expect(rows[1].band).toBe('40m')
    expect(rows[1].sfiVsDistance).toBeUndefined() // single point
  })
})

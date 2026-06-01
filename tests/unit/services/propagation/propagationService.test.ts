import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Dexie database BEFORE importing the service under test.
const cacheStore = new Map<string, unknown>()
const qsoStore = new Map<number, { id: number; propagation?: unknown }>()

vi.mock('../../../../src/db/database', () => {
  const propagationCache = {
    get: vi.fn(async (key: string) => cacheStore.get(key)),
    put: vi.fn(async (entry: { utcHour: string }) => {
      cacheStore.set(entry.utcHour, entry)
    }),
    clear: vi.fn(async () => cacheStore.clear()),
  }
  const qsos = {
    update: vi.fn(async (id: number, changes: Record<string, unknown>) => {
      const existing = qsoStore.get(id) ?? { id }
      qsoStore.set(id, { ...existing, ...changes })
    }),
    toArray: vi.fn(async () => Array.from(qsoStore.values())),
  }
  const transaction = async (
    _mode: string,
    _t1: unknown,
    _t2: unknown,
    cb: () => Promise<void>,
  ) => cb()
  return { db: { propagationCache, qsos, transaction } }
})

vi.mock('../../../../src/services/propagation/noaaProvider', () => ({
  fetchLivePropagation: vi.fn(),
}))

import { db } from '../../../../src/db/database'
import { fetchLivePropagation } from '../../../../src/services/propagation/noaaProvider'
import {
  backfillMissing,
  clearAllPropagationData,
  enrichQso,
  fetchAndCache,
  getCached,
  utcHourKey,
} from '../../../../src/services/propagation/propagationService'

describe('propagationService', () => {
  beforeEach(() => {
    cacheStore.clear()
    qsoStore.clear()
    vi.mocked(fetchLivePropagation).mockReset()
    vi.mocked(db.propagationCache.get).mockClear()
    vi.mocked(db.propagationCache.put).mockClear()
  })

  describe('utcHourKey', () => {
    it('formats UTC hour without timezone drift', () => {
      expect(utcHourKey(new Date('2026-04-28T13:42:11Z'))).toBe('2026-04-28T13')
      expect(utcHourKey('2026-01-05T00:00:00Z')).toBe('2026-01-05T00')
    })

    it('throws on invalid input', () => {
      expect(() => utcHourKey('not-a-date')).toThrow(RangeError)
    })
  })

  describe('getCached', () => {
    it('returns the entry when present and fresh', async () => {
      cacheStore.set('2026-04-28T13', {
        utcHour: '2026-04-28T13',
        sfi: 142,
        source: 'live',
        fetchedAt: new Date().toISOString(),
      })
      const result = await getCached('2026-04-28T13:30:00Z')
      expect(result?.sfi).toBe(142)
    })

    it('ignores expired live entries', async () => {
      cacheStore.set('2026-04-28T13', {
        utcHour: '2026-04-28T13',
        sfi: 142,
        source: 'live',
        fetchedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      })
      expect(await getCached('2026-04-28T13:30:00Z')).toBeUndefined()
    })

    it('keeps historical entries forever', async () => {
      cacheStore.set('2020-01-01T00', {
        utcHour: '2020-01-01T00',
        sfi: 70,
        source: 'historical',
        fetchedAt: '2020-01-02T00:00:00Z',
      })
      const result = await getCached('2020-01-01T00:00:00Z')
      expect(result?.sfi).toBe(70)
    })
  })

  describe('fetchAndCache', () => {
    it('returns cached value when fresh and skips network', async () => {
      cacheStore.set('2026-04-28T13', {
        utcHour: '2026-04-28T13',
        sfi: 130,
        source: 'live',
        fetchedAt: new Date().toISOString(),
      })
      const result = await fetchAndCache('2026-04-28T13:30:00Z')
      expect(result.source).toBe('cached')
      expect(result.sfi).toBe(130)
      expect(fetchLivePropagation).not.toHaveBeenCalled()
    })

    it('fetches and stores on cache miss', async () => {
      vi.mocked(fetchLivePropagation).mockResolvedValueOnce({
        sfi: 150,
        ssn: 90,
        kIndex: 2,
        aIndex: 7,
        source: 'live',
        fetchedAt: '2026-04-28T13:00:00Z',
      })
      const result = await fetchAndCache('2026-04-28T13:30:00Z')
      expect(result.sfi).toBe(150)
      expect(cacheStore.get('2026-04-28T13')).toMatchObject({ utcHour: '2026-04-28T13', sfi: 150 })
    })
  })

  describe('enrichQso', () => {
    it('updates the QSO with the fetched snapshot', async () => {
      qsoStore.set(42, { id: 42 })
      vi.mocked(fetchLivePropagation).mockResolvedValueOnce({
        sfi: 120,
        source: 'live',
        fetchedAt: '2026-04-28T13:00:00Z',
      })
      const result = await enrichQso(42, '2026-04-28T13:30:00Z')
      expect(result?.sfi).toBe(120)
      expect(qsoStore.get(42)?.propagation).toMatchObject({ sfi: 120 })
    })

    it('returns undefined and does not throw on network errors', async () => {
      qsoStore.set(42, { id: 42 })
      vi.mocked(fetchLivePropagation).mockRejectedValueOnce(new Error('boom'))
      const result = await enrichQso(42, '2026-04-28T13:30:00Z')
      expect(result).toBeUndefined()
      expect(qsoStore.get(42)?.propagation).toBeUndefined()
    })
  })

  describe('backfillMissing', () => {
    it('skips QSOs that already have propagation', async () => {
      qsoStore.set(1, { id: 1, date: '2026-04-28T13:00:00Z', propagation: { sfi: 1 } } as never)
      qsoStore.set(2, { id: 2, date: '2026-04-28T13:30:00Z' } as never)
      vi.mocked(fetchLivePropagation).mockResolvedValue({
        sfi: 100, source: 'live', fetchedAt: '2026-04-28T13:00:00Z',
      })
      const result = await backfillMissing()
      expect(result.total).toBe(1)
      expect(result.updated).toBe(1)
      expect(result.cancelled).toBe(false)
    })

    it('reports progress and respects abort signal', async () => {
      qsoStore.set(1, { id: 1, date: '2026-04-28T13:00:00Z' } as never)
      qsoStore.set(2, { id: 2, date: '2026-04-28T14:00:00Z' } as never)
      vi.mocked(fetchLivePropagation).mockResolvedValue({
        sfi: 100, source: 'live', fetchedAt: '2026-04-28T13:00:00Z',
      })
      const controller = new AbortController()
      const seen: number[] = []
      const result = await backfillMissing((p) => {
        seen.push(p.done)
        if (p.done === 1) controller.abort()
      }, controller.signal)
      expect(seen).toEqual([1])
      expect(result.cancelled).toBe(true)
      expect(result.updated).toBe(1)
    })
  })

  describe('clearAllPropagationData', () => {
    it('empties cache and strips propagation from QSOs', async () => {
      cacheStore.set('2026-04-28T13', { utcHour: '2026-04-28T13' } as never)
      qsoStore.set(1, { id: 1, propagation: { sfi: 100 } })
      qsoStore.set(2, { id: 2 })
      await clearAllPropagationData()
      expect(cacheStore.size).toBe(0)
      expect(qsoStore.get(1)?.propagation).toBeUndefined()
      expect(qsoStore.get(2)?.propagation).toBeUndefined()
    })
  })
})

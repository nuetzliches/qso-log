import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  fetchKIndexFor,
  fetchLivePropagation,
  fetchSfi,
  fetchSsn,
  kToA,
} from '../../../../src/services/propagation/noaaProvider'
import { PropagationFetchError, PropagationOfflineError } from '../../../../src/services/propagation/types'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

describe('noaaProvider', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('fetchSfi', () => {
    it('returns the value at-or-before the target date', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-05', flux: 110 },
        { time_tag: '2026-04-09', flux: 132 },
        { time_tag: '2026-04-27', flux: 141 },
      ]))
      expect(await fetchSfi(new Date('2026-04-09T15:28:00Z'))).toBe(132)
    })

    it('returns the closest past value when target is between records', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-05', flux: 110 },
        { time_tag: '2026-04-15', flux: 132 },
        { time_tag: '2026-04-27', flux: 141 },
      ]))
      expect(await fetchSfi(new Date('2026-04-20T00:00:00Z'))).toBe(132)
    })

    it('returns undefined when target is older than the dataset', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-15', flux: 132 },
        { time_tag: '2026-04-27', flux: 141 },
      ]))
      expect(await fetchSfi(new Date('2026-01-01T00:00:00Z'))).toBeUndefined()
    })

    it('returns the newest record when target is in the near future', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-15', flux: 132 },
        { time_tag: '2026-04-27', flux: 141 },
      ]))
      expect(await fetchSfi(new Date('2026-04-29T00:00:00Z'))).toBe(141)
    })

    it('skips non-numeric values', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-26', flux: 132 },
        { time_tag: '2026-04-27', flux: 'NaN' },
      ]))
      expect(await fetchSfi(new Date('2026-04-27T12:00:00Z'))).toBe(132)
    })

    it('returns undefined for empty payload', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([]))
      expect(await fetchSfi(new Date())).toBeUndefined()
    })

    it('throws PropagationFetchError on HTTP error', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(null, false, 500))
      await expect(fetchSfi(new Date())).rejects.toBeInstanceOf(PropagationFetchError)
    })

    it('throws PropagationOfflineError when navigator is offline', async () => {
      const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      try {
        await expect(fetchSfi(new Date())).rejects.toBeInstanceOf(PropagationOfflineError)
      } finally {
        onlineSpy.mockRestore()
      }
    })
  })

  describe('fetchSsn', () => {
    it('reads ssn or sunspot_number field and applies date matching', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([
        { time_tag: '2026-04-05', sunspot_number: 80 },
        { time_tag: '2026-04-15', ssn: '92' },
        { time_tag: '2026-04-27', ssn: 100 },
      ]))
      expect(await fetchSsn(new Date('2026-04-15T12:00:00Z'))).toBe(92)
    })
  })

  describe('fetchKIndexFor', () => {
    it('returns the K value for the closest matching window', async () => {
      const data: unknown[] = [
        ['time_tag', 'kp', 'a_running', 'station_count'],
        ['2026-04-28 09:00:00.000', '2', '2.00', 'observed'],
        ['2026-04-28 12:00:00.000', '4', '4.00', 'observed'],
        ['2026-04-28 15:00:00.000', '5', '5.00', 'observed'],
      ]
      fetchSpy.mockResolvedValueOnce(jsonResponse(data))
      const k = await fetchKIndexFor(new Date('2026-04-28T13:00:00Z'))
      expect(k).toBe(4)
    })

    it('returns undefined when target is more than 6h from any record', async () => {
      const data: unknown[] = [
        ['header'],
        ['2026-04-28 12:00:00.000', '3', '3', 'observed'],
        ['2026-04-28 15:00:00.000', '4', '4', 'observed'],
      ]
      fetchSpy.mockResolvedValueOnce(jsonResponse(data))
      // QSO from a few weeks earlier — must NOT silently pick today's value.
      const k = await fetchKIndexFor(new Date('2026-04-09T15:28:00Z'))
      expect(k).toBeUndefined()
    })

    it('returns undefined for malformed payload', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(['only-header']))
      expect(await fetchKIndexFor(new Date())).toBeUndefined()
    })
  })

  describe('kToA', () => {
    it.each([
      [0, 0],
      [3, 15],
      [5, 48],
      [9, 400],
    ])('maps K=%i to A=%i', (k, a) => {
      expect(kToA(k)).toBe(a)
    })

    it('clamps and rounds out-of-range values', () => {
      expect(kToA(-1)).toBe(0)
      expect(kToA(15)).toBe(400)
      expect(kToA(2.6)).toBe(15)
    })
  })

  describe('fetchLivePropagation', () => {
    it('aggregates partial results when individual calls fail', async () => {
      fetchSpy
        .mockResolvedValueOnce(jsonResponse([{ time_tag: '2026-04-28', flux: 142 }]))
        .mockResolvedValueOnce(jsonResponse(null, false, 503))
        .mockResolvedValueOnce(jsonResponse([
          ['header'],
          ['2026-04-28 12:00:00.000', '3', '3', 'observed'],
        ]))
      const result = await fetchLivePropagation(new Date('2026-04-28T12:30:00Z'))
      expect(result.sfi).toBe(142)
      expect(result.ssn).toBeUndefined()
      expect(result.kIndex).toBe(3)
      expect(result.aIndex).toBe(15)
      expect(result.source).toBe('live')
      expect(result.fetchedAt).toMatch(/T/)
    })
  })
})

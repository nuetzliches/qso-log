import { db } from '../../db/database'
import { fetchLivePropagation } from './noaaProvider'
import type { Propagation, PropagationCacheEntry } from './types'

const LIVE_TTL_MS = 3 * 60 * 60 * 1000 // 3 hours

/**
 * Returns the UTC-hour cache key for a given date/ISO string.
 * Example: '2026-04-28T13:42Z' → '2026-04-28T13'
 */
export function utcHourKey(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) throw new RangeError(`Invalid date: ${String(input)}`)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}`
}

function isLiveExpired(entry: PropagationCacheEntry): boolean {
  if (entry.source !== 'live') return false
  const age = Date.now() - Date.parse(entry.fetchedAt)
  return Number.isFinite(age) ? age > LIVE_TTL_MS : true
}

/**
 * Looks up a cached propagation snapshot for the given moment, ignoring
 * stale 'live' entries beyond the TTL.
 */
export async function getCached(date: Date | string): Promise<Propagation | undefined> {
  const key = utcHourKey(date)
  const entry = await db.propagationCache.get(key)
  if (!entry) return undefined
  if (isLiveExpired(entry)) return undefined
  // Strip storage key for return value
  const { utcHour: _utcHour, ...propagation } = entry
  return propagation
}

async function storeInCache(date: Date | string, propagation: Propagation): Promise<void> {
  const utcHour = utcHourKey(date)
  await db.propagationCache.put({ utcHour, ...propagation })
}

/**
 * Fetches NOAA values for the given moment, populating the cache. Use the
 * cached value when fresh.
 *
 * Caller is responsible for the consent check — this function will hit the
 * network unconditionally.
 */
export async function fetchAndCache(date: Date | string, signal?: AbortSignal): Promise<Propagation> {
  const cached = await getCached(date)
  if (cached) return { ...cached, source: 'cached' }
  const moment = typeof date === 'string' ? new Date(date) : date
  const live = await fetchLivePropagation(moment, signal)
  await storeInCache(date, live)
  return live
}

/**
 * Enriches a single QSO in place. Silently no-ops on offline/network errors so
 * the calling code path (logging) remains robust.
 */
export async function enrichQso(qsoId: number, datetime: string): Promise<Propagation | undefined> {
  try {
    const propagation = await fetchAndCache(datetime)
    await db.qsos.update(qsoId, { propagation })
    return propagation
  } catch {
    // network/offline failures are non-fatal for the QSO itself
    return undefined
  }
}

export interface BackfillProgress {
  done: number
  total: number
  updated: number
}

export interface BackfillResult {
  total: number
  updated: number
  cancelled: boolean
}

const BACKFILL_DELAY_MS = 200

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const id = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

/**
 * Iterates over all QSOs without propagation data and enriches them.
 * Uses the existing UTC-hour cache, so multiple QSOs in the same hour
 * trigger only a single network request.
 */
export async function backfillMissing(
  onProgress?: (p: BackfillProgress) => void,
  signal?: AbortSignal,
): Promise<BackfillResult> {
  const all = await db.qsos.toArray()
  const pending = all.filter((q) => !q.propagation && q.id !== undefined && q.date)
  const total = pending.length
  let done = 0
  let updated = 0

  for (const qso of pending) {
    if (signal?.aborted) return { total, updated, cancelled: true }
    if (qso.id === undefined) continue
    try {
      const propagation = await fetchAndCache(qso.date, signal)
      await db.qsos.update(qso.id, { propagation })
      updated++
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return { total, updated, cancelled: true }
      }
      // network failures are non-fatal — keep going
    }
    done++
    onProgress?.({ done, total, updated })
    if (done < total) {
      try {
        await delay(BACKFILL_DELAY_MS, signal)
      } catch {
        return { total, updated, cancelled: true }
      }
    }
  }

  return { total, updated, cancelled: false }
}

/**
 * Removes the entire propagation cache and strips propagation from all QSOs.
 * Used when the user revokes consent and explicitly opts to clean up.
 */
export async function clearAllPropagationData(): Promise<void> {
  await db.transaction('rw', db.propagationCache, db.qsos, async () => {
    await db.propagationCache.clear()
    const all = await db.qsos.toArray()
    for (const qso of all) {
      if (qso.propagation && qso.id !== undefined) {
        await db.qsos.update(qso.id, { propagation: undefined })
      }
    }
  })
}

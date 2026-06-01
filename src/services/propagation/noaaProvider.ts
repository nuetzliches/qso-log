import { PropagationFetchError, PropagationOfflineError, type Propagation } from './types'

const F107_URL = 'https://services.swpc.noaa.gov/json/f107_cm_flux.json'
const SSN_URL = 'https://services.swpc.noaa.gov/json/sunspot_report.json'
const KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'

const FETCH_OPTS: RequestInit = {
  referrerPolicy: 'no-referrer',
  credentials: 'omit',
  mode: 'cors',
}

interface FluxRow {
  time_tag?: string
  flux?: number | string
}

interface SsnRow {
  time_tag?: string
  ssn?: number | string
  sunspot_number?: number | string
}

/**
 * NOAA returns the K-Index product as a 2D array where the first row is a header.
 * Subsequent rows look like ["2026-04-28 12:00:00.000", "3", "3.00", "observed"].
 */
type KpRow = [string, string, string, string]

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new PropagationOfflineError()
  }
  let res: Response
  try {
    res = await fetch(url, { ...FETCH_OPTS, signal })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err
    throw new PropagationFetchError(`Network error fetching ${url}`, err)
  }
  if (!res.ok) {
    throw new PropagationFetchError(`HTTP ${res.status} fetching ${url}`)
  }
  return res.json() as Promise<T>
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

/**
 * NOAA's daily JSON archives contain only a rolling window (typically a few
 * weeks). When the requested date is older than the oldest record, we return
 * `undefined` rather than silently substituting the most recent value.
 */
function findClosestPastRow<T>(
  rows: T[],
  target: Date,
  getTimestamp: (row: T) => string | undefined,
  getValue: (row: T) => number | undefined,
): number | undefined {
  if (!Array.isArray(rows) || rows.length === 0) return undefined
  const targetMs = target.getTime()
  let bestPast: { delta: number; value: number } | undefined
  let bestFuture: { delta: number; value: number } | undefined
  let oldest: number | undefined
  let newest: number | undefined
  for (const row of rows) {
    const ts = parseUtcTimestamp(getTimestamp(row))
    const value = getValue(row)
    if (ts === undefined || value === undefined) continue
    if (oldest === undefined || ts < oldest) oldest = ts
    if (newest === undefined || ts > newest) newest = ts
    if (ts <= targetMs) {
      const delta = targetMs - ts
      if (bestPast === undefined || delta < bestPast.delta) bestPast = { delta, value }
    } else {
      const delta = ts - targetMs
      if (bestFuture === undefined || delta < bestFuture.delta) bestFuture = { delta, value }
    }
  }
  // Prefer the most recent record AT OR BEFORE the target.
  if (bestPast !== undefined) return bestPast.value
  // If the target is before the oldest record, the dataset doesn't cover it.
  if (oldest !== undefined && targetMs < oldest) return undefined
  // Edge case: target is between the newest record and "now" → use that.
  return bestFuture?.value
}

/**
 * Solar flux value (F10.7 cm) for the given date. Returns the most recent
 * record at or before `target`. If `target` predates the dataset, returns
 * `undefined` rather than substituting today's value.
 */
export async function fetchSfi(target: Date, signal?: AbortSignal): Promise<number | undefined> {
  const rows = await fetchJson<FluxRow[]>(F107_URL, signal)
  return findClosestPastRow<FluxRow>(rows, target, (r) => r?.time_tag, (r) => toNumber(r?.flux))
}

/**
 * Sunspot number for the given date. Same date-matching semantics as `fetchSfi`.
 */
export async function fetchSsn(target: Date, signal?: AbortSignal): Promise<number | undefined> {
  const rows = await fetchJson<SsnRow[]>(SSN_URL, signal)
  return findClosestPastRow<SsnRow>(
    rows,
    target,
    (r) => r?.time_tag,
    (r) => toNumber(r?.ssn ?? r?.sunspot_number),
  )
}

/**
 * Maximum gap (ms) accepted between the target moment and the matched K-Index
 * record. K is reported in 3-hour windows, so 6 hours of slack is generous
 * but still rejects matches that are days off (e.g. when `target` predates
 * the dataset entirely).
 */
const K_INDEX_MAX_DELTA_MS = 6 * 60 * 60 * 1000

/**
 * Returns the planetary K-Index for the 3-hour window closest to `target`.
 * Returns `undefined` when the closest record is more than 6 h away — this
 * prevents silently substituting today's value for older QSOs.
 */
export async function fetchKIndexFor(target: Date, signal?: AbortSignal): Promise<number | undefined> {
  const data = await fetchJson<unknown[]>(KP_URL, signal)
  if (!Array.isArray(data) || data.length < 2) return undefined
  // First row is header
  const rows = data.slice(1) as KpRow[]
  const targetMs = target.getTime()
  let best: { delta: number; k: number } | undefined
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue
    const ts = parseUtcTimestamp(row[0])
    const k = toNumber(row[1])
    if (ts === undefined || k === undefined) continue
    const delta = Math.abs(ts - targetMs)
    if (best === undefined || delta < best.delta) best = { delta, k }
  }
  if (best === undefined || best.delta > K_INDEX_MAX_DELTA_MS) return undefined
  return best.k
}

/**
 * NOAA timestamps look like '2026-04-28 12:00:00.000' (UTC, no Z).
 */
function parseUtcTimestamp(value: string | undefined): number | undefined {
  if (typeof value !== 'string') return undefined
  const iso = value.includes('T') ? value : value.replace(' ', 'T')
  const ms = Date.parse(iso.endsWith('Z') ? iso : `${iso}Z`)
  return Number.isFinite(ms) ? ms : undefined
}

/**
 * Approximation: A-Index from a single 3-h K value (Bartels conversion table).
 * Real A-index is the daily mean; this is "good enough" for the logged moment.
 */
export function kToA(k: number): number {
  const table: Record<number, number> = {
    0: 0, 1: 3, 2: 7, 3: 15, 4: 27, 5: 48, 6: 80, 7: 140, 8: 240, 9: 400,
  }
  const rounded = Math.max(0, Math.min(9, Math.round(k)))
  return table[rounded] ?? 0
}

/**
 * Live snapshot for the given moment. Throws PropagationOfflineError when offline,
 * PropagationFetchError on HTTP/parse failures.
 */
export async function fetchLivePropagation(target: Date, signal?: AbortSignal): Promise<Propagation> {
  const [sfi, ssn, kIndex] = await Promise.all([
    fetchSfi(target, signal).catch(() => undefined),
    fetchSsn(target, signal).catch(() => undefined),
    fetchKIndexFor(target, signal).catch(() => undefined),
  ])
  return {
    sfi,
    ssn,
    kIndex,
    aIndex: kIndex !== undefined ? kToA(kIndex) : undefined,
    source: 'live',
    fetchedAt: new Date().toISOString(),
  }
}

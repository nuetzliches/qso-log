import type { QSO } from '../types/qso'
import { getBandNames } from '../utils/frequency'
import { calculateDistanceKm, calculateBearing, bearingToCompass } from '../utils/locator'
import { lookupDxcc, toFlagEmoji } from '../utils/dxcc'

// ── Band/Mode ──────────────────────────────────────────────────────────

export function aggregateByBand(qsos: QSO[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const q of qsos) {
    if (!q.band) continue
    map.set(q.band, (map.get(q.band) ?? 0) + 1)
  }
  return map
}

export function aggregateByMode(qsos: QSO[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const q of qsos) {
    if (!q.mode) continue
    map.set(q.mode, (map.get(q.mode) ?? 0) + 1)
  }
  return map
}

export function aggregateByBandAndMode(qsos: QSO[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()
  for (const q of qsos) {
    if (!q.band || !q.mode) continue
    if (!map.has(q.band)) map.set(q.band, new Map())
    const modeMap = map.get(q.band)!
    modeMap.set(q.mode, (modeMap.get(q.mode) ?? 0) + 1)
  }
  return map
}

export function sortBands(bands: string[]): string[] {
  const order = getBandNames()
  return [...bands].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

export function topEntry(map: Map<string, number>): { key: string; count: number } | null {
  let best: { key: string; count: number } | null = null
  for (const [key, count] of map) {
    if (!best || count > best.count) best = { key, count }
  }
  return best
}

// ── Activity / Timeline ────────────────────────────────────────────────

export function aggregateByDay(qsos: QSO[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const q of qsos) {
    const day = q.date.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return map
}

export function aggregateByWeek(qsos: QSO[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const q of qsos) {
    const d = new Date(q.date)
    const dayOfWeek = d.getUTCDay() || 7
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() - dayOfWeek + 1)
    const key = monday.toISOString().slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

export function aggregateByMonth(qsos: QSO[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const q of qsos) {
    const month = q.date.slice(0, 7)
    map.set(month, (map.get(month) ?? 0) + 1)
  }
  return map
}

export function calculateStreaks(qsos: QSO[]): { current: number; longest: number; longestStart: string } {
  if (qsos.length === 0) return { current: 0, longest: 0, longestStart: '' }

  const days = new Set(qsos.map((q) => q.date.slice(0, 10)))
  const sorted = [...days].sort()

  let longest = 1
  let longestStart = sorted[0]
  let currentStreak = 1
  let currentStart = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      currentStreak++
    } else {
      currentStreak = 1
      currentStart = sorted[i]
    }

    if (currentStreak > longest) {
      longest = currentStreak
      longestStart = currentStart
    }
  }

  // Current streak: check if the last day in sorted is today or yesterday
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastDay = sorted[sorted.length - 1]

  let current = 0
  if (lastDay === today || lastDay === yesterday) {
    current = 1
    for (let i = sorted.length - 2; i >= 0; i--) {
      const prev = new Date(sorted[i])
      const next = new Date(sorted[i + 1])
      const diff = (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current++
      } else {
        break
      }
    }
  }

  return { current, longest, longestStart }
}

export function findMostActiveDay(qsos: QSO[]): { date: string; count: number } | null {
  const byDay = aggregateByDay(qsos)
  const top = topEntry(byDay)
  return top ? { date: top.key, count: top.count } : null
}

export function countQsosInPeriod(qsos: QSO[], startDate: string): number {
  return qsos.filter((q) => q.date >= startDate).length
}

// ── DXCC / Countries ───────────────────────────────────────────────────

export interface CountryStats {
  country: string
  iso2?: string
  flag: string
  count: number
  firstDate: string
  lastDate: string
}

export function aggregateByCountry(qsos: QSO[]): CountryStats[] {
  const map = new Map<string, CountryStats>()

  for (const q of qsos) {
    let country = q.country
    let iso2 = q.countryCode

    if (!country) {
      const dxcc = lookupDxcc(q.callsign)
      if (dxcc) {
        country = dxcc.country
        iso2 = dxcc.iso2
      }
    }

    if (!country) continue

    const key = country
    const existing = map.get(key)
    const date = q.date.slice(0, 10)

    if (existing) {
      existing.count++
      if (date < existing.firstDate) existing.firstDate = date
      if (date > existing.lastDate) existing.lastDate = date
    } else {
      map.set(key, {
        country,
        iso2,
        flag: iso2 ? toFlagEmoji(iso2) : '',
        count: 1,
        firstDate: date,
        lastDate: date,
      })
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count)
}

export function countUniqueDxcc(qsos: QSO[]): number {
  const countries = new Set<string>()
  for (const q of qsos) {
    const country = q.country || lookupDxcc(q.callsign)?.country
    if (country) countries.add(country)
  }
  return countries.size
}

// ── Distance / Locator ─────────────────────────────────────────────────

export interface DistanceEntry {
  callsign: string
  locator: string
  country?: string
  flag: string
  distance: number
  bearing: number
  compass: string
  date: string
}

export interface DistanceStats {
  farthest: DistanceEntry | null
  average: number
  total: number
  withLocator: number
  withoutLocator: number
  uniqueGridSquares: number
}

export function calculateDistanceStats(qsos: QSO[], ownLocator: string): DistanceStats {
  const entries: DistanceEntry[] = []
  const gridSquares = new Set<string>()
  let withoutLocator = 0

  for (const q of qsos) {
    const loc = q.locator
    if (!loc) {
      withoutLocator++
      continue
    }

    gridSquares.add(loc.slice(0, 4).toUpperCase())

    const myLoc = q.myLocator || ownLocator
    if (!myLoc) continue

    const dist = calculateDistanceKm(myLoc, loc)
    const bear = calculateBearing(myLoc, loc)
    if (dist === null || bear === null) continue

    const dxcc = q.country ? { country: q.country, iso2: q.countryCode } : lookupDxcc(q.callsign)

    entries.push({
      callsign: q.callsign,
      locator: loc,
      country: dxcc?.country,
      flag: dxcc?.iso2 ? toFlagEmoji(dxcc.iso2) : '',
      distance: dist,
      bearing: bear,
      compass: bearingToCompass(bear),
      date: q.date.slice(0, 10),
    })
  }

  entries.sort((a, b) => b.distance - a.distance)

  const totalDist = entries.reduce((sum, e) => sum + e.distance, 0)

  return {
    farthest: entries[0] ?? null,
    average: entries.length > 0 ? Math.round(totalDist / entries.length) : 0,
    total: totalDist,
    withLocator: entries.length,
    withoutLocator,
    uniqueGridSquares: gridSquares.size,
  }
}

export function getDistanceBuckets(qsos: QSO[], ownLocator: string): Map<string, number> {
  const buckets = new Map<string, number>([
    ['0–100 km', 0],
    ['100–500 km', 0],
    ['500–1000 km', 0],
    ['1000–2000 km', 0],
    ['2000–5000 km', 0],
    ['>5000 km', 0],
  ])

  for (const q of qsos) {
    if (!q.locator) continue
    const myLoc = q.myLocator || ownLocator
    if (!myLoc) continue
    const dist = calculateDistanceKm(myLoc, q.locator)
    if (dist === null) continue

    if (dist <= 100) buckets.set('0–100 km', buckets.get('0–100 km')! + 1)
    else if (dist <= 500) buckets.set('100–500 km', buckets.get('100–500 km')! + 1)
    else if (dist <= 1000) buckets.set('500–1000 km', buckets.get('500–1000 km')! + 1)
    else if (dist <= 2000) buckets.set('1000–2000 km', buckets.get('1000–2000 km')! + 1)
    else if (dist <= 5000) buckets.set('2000–5000 km', buckets.get('2000–5000 km')! + 1)
    else buckets.set('>5000 km', buckets.get('>5000 km')! + 1)
  }

  return buckets
}

export function getTopDistances(qsos: QSO[], ownLocator: string, limit = 10): DistanceEntry[] {
  const entries: DistanceEntry[] = []

  for (const q of qsos) {
    if (!q.locator) continue
    const myLoc = q.myLocator || ownLocator
    if (!myLoc) continue
    const dist = calculateDistanceKm(myLoc, q.locator)
    const bear = calculateBearing(myLoc, q.locator)
    if (dist === null || bear === null) continue

    const dxcc = q.country ? { country: q.country, iso2: q.countryCode } : lookupDxcc(q.callsign)
    entries.push({
      callsign: q.callsign,
      locator: q.locator,
      country: dxcc?.country,
      flag: dxcc?.iso2 ? toFlagEmoji(dxcc.iso2) : '',
      distance: dist,
      bearing: bear,
      compass: bearingToCompass(bear),
      date: q.date.slice(0, 10),
    })
  }

  entries.sort((a, b) => b.distance - a.distance)
  return entries.slice(0, limit)
}

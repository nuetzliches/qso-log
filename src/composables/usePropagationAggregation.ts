import type { QSO } from '../types/qso'
import { calculateDistanceKm, isValidLocator } from '../utils/locator'

/**
 * Pearson product-moment correlation coefficient. Returns undefined when
 * fewer than two valid pairs are present or both series are constant.
 */
export function pearson(xs: number[], ys: number[]): number | undefined {
  if (xs.length !== ys.length || xs.length < 2) return undefined
  const n = xs.length
  let sumX = 0, sumY = 0
  for (let i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i] }
  const meanX = sumX / n
  const meanY = sumY / n
  let num = 0, denomX = 0, denomY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }
  if (denomX === 0 || denomY === 0) return undefined
  return num / Math.sqrt(denomX * denomY)
}

export function qsosWithPropagation(qsos: QSO[]): QSO[] {
  return qsos.filter((q) => q.propagation !== undefined)
}

/**
 * Returns SFI/distance pairs grouped by band for scatter plotting.
 */
export interface SfiDistancePoint {
  sfi: number
  distance: number
  band: string
}

export function sfiDistancePairs(qsos: QSO[], ownLocator: string): SfiDistancePoint[] {
  if (!isValidLocator(ownLocator)) return []
  const out: SfiDistancePoint[] = []
  for (const q of qsos) {
    const sfi = q.propagation?.sfi
    if (sfi === undefined) continue
    if (!q.locator || !isValidLocator(q.locator)) continue
    const distance = calculateDistanceKm(ownLocator, q.locator)
    if (distance === undefined || distance === null) continue
    out.push({ sfi, distance, band: q.band })
  }
  return out
}

/**
 * QSO counts grouped by K-index value (0..9) and band.
 */
export function kIndexBandMatrix(qsos: QSO[]): Map<number, Map<string, number>> {
  const matrix = new Map<number, Map<string, number>>()
  for (const q of qsos) {
    const k = q.propagation?.kIndex
    if (k === undefined) continue
    const kRounded = Math.max(0, Math.min(9, Math.round(k)))
    let row = matrix.get(kRounded)
    if (!row) {
      row = new Map()
      matrix.set(kRounded, row)
    }
    row.set(q.band, (row.get(q.band) ?? 0) + 1)
  }
  return matrix
}

export interface BandCorrelation {
  band: string
  count: number
  sfiVsDistance: number | undefined
}

/**
 * Per-band Pearson correlation between SFI and distance.
 */
export function correlationByBand(qsos: QSO[], ownLocator: string): BandCorrelation[] {
  const pairs = sfiDistancePairs(qsos, ownLocator)
  const byBand = new Map<string, { sfi: number[]; dist: number[] }>()
  for (const p of pairs) {
    let bucket = byBand.get(p.band)
    if (!bucket) {
      bucket = { sfi: [], dist: [] }
      byBand.set(p.band, bucket)
    }
    bucket.sfi.push(p.sfi)
    bucket.dist.push(p.distance)
  }
  const result: BandCorrelation[] = []
  for (const [band, { sfi, dist }] of byBand) {
    result.push({ band, count: sfi.length, sfiVsDistance: pearson(sfi, dist) })
  }
  return result.sort((a, b) => b.count - a.count)
}

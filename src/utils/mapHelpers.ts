import type { QSO } from '../types/qso'
import type { MapMarker, MapQsoSummary } from '../types/map'
import { locatorToLatLon, calculateDistanceKm, calculateBearing, isValidLocator } from './locator'

export function groupQsosByLocator(qsos: QSO[], ownLocator?: string): MapMarker[] {
  const validOwn = ownLocator && isValidLocator(ownLocator) ? ownLocator : undefined
  const markerMap = new Map<string, MapMarker>()

  for (const qso of qsos) {
    if (!qso.locator || !isValidLocator(qso.locator)) continue

    const locator = qso.locator.toUpperCase()

    if (!markerMap.has(locator)) {
      const latLon = locatorToLatLon(locator)
      if (!latLon) continue

      const distanceKm = validOwn ? (calculateDistanceKm(validOwn, locator) ?? undefined) : undefined
      const bearing = validOwn ? (calculateBearing(validOwn, locator) ?? undefined) : undefined

      markerMap.set(locator, { locator, latLon, qsos: [], distanceKm, bearing })
    }

    const marker = markerMap.get(locator)!
    const summary: MapQsoSummary = {
      id: qso.id,
      callsign: qso.callsign,
      date: qso.date,
      mode: qso.mode,
      band: qso.band,
      distanceKm: marker.distanceKm,
      bearing: marker.bearing,
    }
    marker.qsos.push(summary)
  }

  return Array.from(markerMap.values())
}

const LOCATOR_4 = /^[A-Ra-r]{2}[0-9]{2}$/
const LOCATOR_6 = /^[A-Ra-r]{2}[0-9]{2}[A-Xa-x]{2}$/

export function isValidLocator(locator: string): boolean {
  return LOCATOR_4.test(locator) || LOCATOR_6.test(locator)
}

export function formatLocator(locator: string): string {
  if (locator.length === 4) {
    return locator.slice(0, 2).toUpperCase() + locator.slice(2, 4)
  }
  if (locator.length === 6) {
    return locator.slice(0, 2).toUpperCase() + locator.slice(2, 4) + locator.slice(4, 6).toLowerCase()
  }
  return locator
}

export function locatorToLatLon(locator: string): { lat: number; lon: number } | null {
  if (!isValidLocator(locator)) return null

  const upper = locator.toUpperCase()
  let lon = (upper.charCodeAt(0) - 65) * 20 - 180
  let lat = (upper.charCodeAt(1) - 65) * 10 - 90
  lon += parseInt(upper[2]) * 2
  lat += parseInt(upper[3]) * 1

  if (upper.length === 6) {
    lon += (upper.charCodeAt(4) - 65) * (2 / 24)
    lat += (upper.charCodeAt(5) - 65) * (1 / 24)
    // Center of subsquare
    lon += 1 / 24
    lat += 0.5 / 24
  } else {
    // Center of square
    lon += 1
    lat += 0.5
  }

  return { lat, lon }
}

const DEG_TO_RAD = Math.PI / 180
const EARTH_RADIUS_KM = 6371

export function calculateDistanceKm(loc1: string, loc2: string): number | null {
  const p1 = locatorToLatLon(loc1)
  const p2 = locatorToLatLon(loc2)
  if (!p1 || !p2) return null

  const dLat = (p2.lat - p1.lat) * DEG_TO_RAD
  const dLon = (p2.lon - p1.lon) * DEG_TO_RAD
  const lat1 = p1.lat * DEG_TO_RAD
  const lat2 = p2.lat * DEG_TO_RAD

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(EARTH_RADIUS_KM * c)
}

export function calculateBearing(from: string, to: string): number | null {
  const p1 = locatorToLatLon(from)
  const p2 = locatorToLatLon(to)
  if (!p1 || !p2) return null

  const lat1 = p1.lat * DEG_TO_RAD
  const lat2 = p2.lat * DEG_TO_RAD
  const dLon = (p2.lon - p1.lon) * DEG_TO_RAD

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  return Math.round(bearing)
}

export function latLonToLocator(lat: number, lon: number): string {
  const clampedLat = Math.max(-90, Math.min(lat, 90))
  const clampedLon = Math.max(-180, Math.min(lon, 180))

  const lonAdj = clampedLon + 180
  const latAdj = clampedLat + 90

  const fieldLon = Math.min(Math.floor(lonAdj / 20), 17)
  const fieldLat = Math.min(Math.floor(latAdj / 10), 17)
  const squareLon = Math.min(Math.floor((lonAdj % 20) / 2), 9)
  const squareLat = Math.min(Math.floor(latAdj % 10), 9)
  const subLon = Math.min(Math.floor((lonAdj % 2) / (2 / 24)), 23)
  const subLat = Math.min(Math.floor((latAdj % 1) / (1 / 24)), 23)

  return (
    String.fromCharCode(65 + fieldLon) +
    String.fromCharCode(65 + fieldLat) +
    squareLon.toString() +
    squareLat.toString() +
    String.fromCharCode(97 + subLon) +
    String.fromCharCode(97 + subLat)
  )
}

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export function bearingToCompass(degrees: number): string {
  const index = Math.round(degrees / 45) % 8
  return COMPASS_POINTS[index]
}

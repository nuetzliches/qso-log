import { describe, it, expect } from 'vitest'
import {
  isValidLocator,
  formatLocator,
  locatorToLatLon,
  calculateDistanceKm,
  calculateBearing,
  bearingToCompass,
} from '../../../src/utils/locator'

describe('isValidLocator', () => {
  it('accepts 4-character locators', () => {
    expect(isValidLocator('JN47')).toBe(true)
    expect(isValidLocator('AA00')).toBe(true)
    expect(isValidLocator('RR99')).toBe(true)
  })

  it('accepts 6-character locators', () => {
    expect(isValidLocator('JN47ao')).toBe(true)
    expect(isValidLocator('JO30kx')).toBe(true)
    expect(isValidLocator('AA00aa')).toBe(true)
  })

  it('is case-insensitive for field letters', () => {
    expect(isValidLocator('jn47')).toBe(true)
    expect(isValidLocator('JN47AO')).toBe(true)
    expect(isValidLocator('jn47AO')).toBe(true)
  })

  it('rejects invalid locators', () => {
    expect(isValidLocator('')).toBe(false)
    expect(isValidLocator('JN')).toBe(false)
    expect(isValidLocator('JN4')).toBe(false)
    expect(isValidLocator('JN47a')).toBe(false)
    expect(isValidLocator('ZZ99')).toBe(false) // Z > R
    expect(isValidLocator('JN47az')).toBe(false) // z > x
    expect(isValidLocator('1234')).toBe(false)
  })
})

describe('formatLocator', () => {
  it('formats 4-character locators with uppercase field', () => {
    expect(formatLocator('jn47')).toBe('JN47')
  })

  it('formats 6-character locators with uppercase field and lowercase subsquare', () => {
    expect(formatLocator('JN47AO')).toBe('JN47ao')
    expect(formatLocator('jn47ao')).toBe('JN47ao')
  })

  it('returns input unchanged for other lengths', () => {
    expect(formatLocator('JN')).toBe('JN')
  })
})

describe('locatorToLatLon', () => {
  it('converts JN47 to approximate center of that square', () => {
    const result = locatorToLatLon('JN47')
    expect(result).not.toBeNull()
    expect(result!.lat).toBeCloseTo(47.5, 0)
    expect(result!.lon).toBeCloseTo(9, 0)
  })

  it('converts JO30 to approximate location', () => {
    const result = locatorToLatLon('JO30')
    expect(result).not.toBeNull()
    expect(result!.lat).toBeCloseTo(50.5, 0)
    // JO30: J=9, O=14 -> lon = 9*20 - 180 + 0*2 + 1 = 1 -> actually 9*20=180-180=0 + 0*2 +1 = 1
    // Wait: J=9 (A=0), so 9*20 - 180 = 0, then +3*2 = 6, center +1 = 7
    expect(result!.lon).toBeCloseTo(7, 0)
  })

  it('converts 6-character locator with higher precision', () => {
    const result = locatorToLatLon('JN47ao')
    expect(result).not.toBeNull()
    expect(result!.lat).toBeGreaterThan(47)
    expect(result!.lat).toBeLessThan(48)
  })

  it('returns null for invalid locator', () => {
    expect(locatorToLatLon('')).toBeNull()
    expect(locatorToLatLon('ZZ99')).toBeNull()
  })
})

describe('calculateDistanceKm', () => {
  it('calculates distance between two locators', () => {
    // JN47 (southern Germany) to JO30 (northern France/Belgium)
    const km = calculateDistanceKm('JN47', 'JO30')
    expect(km).not.toBeNull()
    expect(km!).toBeGreaterThan(200)
    expect(km!).toBeLessThan(700)
  })

  it('returns 0 for same locator', () => {
    const km = calculateDistanceKm('JN47ao', 'JN47ao')
    expect(km).toBe(0)
  })

  it('returns null if either locator is invalid', () => {
    expect(calculateDistanceKm('JN47', 'ZZZZ')).toBeNull()
    expect(calculateDistanceKm('', 'JN47')).toBeNull()
  })

  it('calculates long distance correctly', () => {
    // AA00 to RR99 — should be several thousand km
    const km = calculateDistanceKm('AA00', 'RR99')
    expect(km).not.toBeNull()
    expect(km!).toBeGreaterThan(5000)
  })
})

describe('calculateBearing', () => {
  it('returns bearing in degrees', () => {
    const bearing = calculateBearing('JN47', 'JO30')
    expect(bearing).not.toBeNull()
    expect(bearing!).toBeGreaterThanOrEqual(0)
    expect(bearing!).toBeLessThan(360)
  })

  it('returns null for invalid locators', () => {
    expect(calculateBearing('JN47', '')).toBeNull()
  })
})

describe('bearingToCompass', () => {
  it('converts 0 to N', () => {
    expect(bearingToCompass(0)).toBe('N')
  })

  it('converts 90 to E', () => {
    expect(bearingToCompass(90)).toBe('E')
  })

  it('converts 180 to S', () => {
    expect(bearingToCompass(180)).toBe('S')
  })

  it('converts 270 to W', () => {
    expect(bearingToCompass(270)).toBe('W')
  })

  it('converts 45 to NE', () => {
    expect(bearingToCompass(45)).toBe('NE')
  })

  it('converts 350 to N', () => {
    expect(bearingToCompass(350)).toBe('N')
  })
})

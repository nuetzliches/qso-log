import { describe, it, expect } from 'vitest'
import { getDefaultRst, isValidRst } from '../../../src/utils/rst'

describe('getDefaultRst', () => {
  it('returns 599 for CW', () => {
    expect(getDefaultRst('CW')).toBe('599')
  })

  it('returns 599 for FT8', () => {
    expect(getDefaultRst('FT8')).toBe('599')
  })

  it('returns 59 for SSB', () => {
    expect(getDefaultRst('SSB')).toBe('59')
  })

  it('returns 59 for FM', () => {
    expect(getDefaultRst('FM')).toBe('59')
  })

  it('is case-insensitive', () => {
    expect(getDefaultRst('cw')).toBe('599')
    expect(getDefaultRst('ssb')).toBe('59')
  })

  it('defaults to 59 for unknown modes', () => {
    expect(getDefaultRst('UNKNOWN')).toBe('59')
  })
})

describe('isValidRst', () => {
  it('validates 3-digit RST for CW', () => {
    expect(isValidRst('599', 'CW')).toBe(true)
    expect(isValidRst('319', 'CW')).toBe(true)
    expect(isValidRst('59', 'CW')).toBe(false)
    expect(isValidRst('600', 'CW')).toBe(false)
  })

  it('validates 2-digit RS for SSB', () => {
    expect(isValidRst('59', 'SSB')).toBe(true)
    expect(isValidRst('31', 'SSB')).toBe(true)
    expect(isValidRst('599', 'SSB')).toBe(false)
    expect(isValidRst('60', 'SSB')).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { frequencyToBand, parseFrequency, getBandNames, getBandFrequencyRange } from '../../../src/utils/frequency'

describe('frequencyToBand', () => {
  it('maps 14.074 to 20m', () => {
    expect(frequencyToBand(14.074)).toBe('20m')
  })

  it('maps 7.1 to 40m', () => {
    expect(frequencyToBand(7.1)).toBe('40m')
  })

  it('maps 145.5 to 2m', () => {
    expect(frequencyToBand(145.5)).toBe('2m')
  })

  it('maps 433.5 to 70cm', () => {
    expect(frequencyToBand(433.5)).toBe('70cm')
  })

  it('maps band edges correctly', () => {
    expect(frequencyToBand(1.81)).toBe('160m')
    expect(frequencyToBand(2.0)).toBe('160m')
  })

  it('returns empty string for out-of-band frequency', () => {
    expect(frequencyToBand(5.0)).toBe('')
    expect(frequencyToBand(100.0)).toBe('')
  })
})

describe('parseFrequency', () => {
  it('parses decimal frequency', () => {
    expect(parseFrequency('14.074')).toBe(14.074)
  })

  it('parses comma as decimal separator', () => {
    expect(parseFrequency('14,074')).toBe(14.074)
  })

  it('strips non-numeric characters', () => {
    expect(parseFrequency('14.074 MHz')).toBe(14.074)
  })

  it('returns null for invalid input', () => {
    expect(parseFrequency('abc')).toBeNull()
    expect(parseFrequency('')).toBeNull()
  })
})

describe('getBandNames', () => {
  it('returns all band names', () => {
    const names = getBandNames()
    expect(names).toContain('20m')
    expect(names).toContain('2m')
    expect(names).toContain('70cm')
    expect(names.length).toBe(14)
  })
})

describe('getBandFrequencyRange', () => {
  it('returns range for known band', () => {
    const range = getBandFrequencyRange('20m')
    expect(range).toEqual({ lower: 14.0, upper: 14.35 })
  })

  it('returns null for unknown band', () => {
    expect(getBandFrequencyRange('99m')).toBeNull()
  })
})

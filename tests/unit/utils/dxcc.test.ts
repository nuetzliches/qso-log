import { describe, it, expect } from 'vitest'
import { lookupDxcc, toFlagEmoji } from '../../../src/utils/dxcc'

describe('lookupDxcc', () => {
  it('resolves DL call to Germany', () => {
    const r = lookupDxcc('DL1ABC')
    expect(r?.country).toBe('Germany')
    expect(r?.iso2).toBe('DE')
  })

  it('resolves OE call to Austria', () => {
    const r = lookupDxcc('OE5XYZ')
    expect(r?.country).toBe('Austria')
    expect(r?.iso2).toBe('AT')
  })

  it('resolves G call to England', () => {
    const r = lookupDxcc('G3ZRJ')
    expect(r?.country).toBe('England')
    expect(r?.iso2).toBe('GB')
  })

  it('resolves W call to United States', () => {
    const r = lookupDxcc('W1AW')
    expect(r?.country).toBe('United States')
    expect(r?.iso2).toBe('US')
  })

  it('resolves K call to United States', () => {
    const r = lookupDxcc('K5ZZZ')
    expect(r?.country).toBe('United States')
    expect(r?.iso2).toBe('US')
  })

  it('resolves JA call to Japan', () => {
    const r = lookupDxcc('JA1XYZ')
    expect(r?.country).toBe('Japan')
    expect(r?.iso2).toBe('JP')
  })

  it('resolves VK call to Australia', () => {
    const r = lookupDxcc('VK2ABC')
    expect(r?.country).toBe('Australia')
    expect(r?.iso2).toBe('AU')
  })

  it('resolves UA call to Russia', () => {
    const r = lookupDxcc('UA3ABC')
    expect(r?.country).toBe('Russia')
    expect(r?.iso2).toBe('RU')
  })

  it('resolves F call to France', () => {
    const r = lookupDxcc('F5VGP')
    expect(r?.country).toBe('France')
    expect(r?.iso2).toBe('FR')
  })

  it('resolves HB call to Switzerland', () => {
    const r = lookupDxcc('HB9ABC')
    expect(r?.country).toBe('Switzerland')
    expect(r?.iso2).toBe('CH')
  })

  it('resolves HB0 prefix to Liechtenstein (longer match beats HB)', () => {
    const r = lookupDxcc('HB0ABC')
    expect(r?.country).toBe('Liechtenstein')
    expect(r?.iso2).toBe('LI')
  })

  it('resolves SV5 prefix to Dodecanese (longer match beats SV)', () => {
    const r = lookupDxcc('SV5ABC')
    expect(r?.country).toBe('Dodecanese')
    expect(r?.iso2).toBe('GR')
  })

  it('resolves SV1 to Greece', () => {
    const r = lookupDxcc('SV1ABC')
    expect(r?.country).toBe('Greece')
    expect(r?.iso2).toBe('GR')
  })

  it('strips portable suffix /P before matching', () => {
    const r = lookupDxcc('DL1ABC/P')
    expect(r?.country).toBe('Germany')
    expect(r?.iso2).toBe('DE')
  })

  it('strips /MM suffix before matching', () => {
    const r = lookupDxcc('OE1XYZ/MM')
    expect(r?.country).toBe('Austria')
    expect(r?.iso2).toBe('AT')
  })

  it('returns undefined for unrecognised prefix', () => {
    expect(lookupDxcc('QQ9YY')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(lookupDxcc('')).toBeUndefined()
  })

  it('is case-insensitive (lowercase input)', () => {
    const r = lookupDxcc('dl1abc')
    expect(r?.country).toBe('Germany')
  })
})

describe('toFlagEmoji', () => {
  it('converts DE to lowercase flag code', () => {
    expect(toFlagEmoji('DE')).toBe('de')
  })

  it('converts US to lowercase flag code', () => {
    expect(toFlagEmoji('US')).toBe('us')
  })

  it('converts GB to lowercase flag code', () => {
    expect(toFlagEmoji('GB')).toBe('gb')
  })

  it('accepts lowercase input', () => {
    expect(toFlagEmoji('de')).toBe('de')
  })
})

import { describe, it, expect } from 'vitest'
import { csvImporter } from '../../../../src/services/import/csvImporter'

describe('csvImporter.parse', () => {
  it('parses CSV with header', () => {
    const csv = `date,callsign,mode,power,frequency,band,rstSent,rstReceived,remarks,qslSent,qslReceived
2024-03-15T14:30:00.000Z,DL1ABC,SSB,100W,14.200,20m,59,57,Nice QSO,no,no`

    const result = csvImporter.parse(csv)
    expect(result).toHaveLength(1)
    expect(result[0].callsign).toBe('DL1ABC')
    expect(result[0].mode).toBe('SSB')
    expect(result[0].frequency).toBe('14.200')
  })

  it('handles quoted fields with commas', () => {
    const csv = `date,callsign,mode,power,frequency,band,rstSent,rstReceived,remarks,qslSent,qslReceived
2024-03-15T14:30:00.000Z,DL1ABC,SSB,100W,14.200,20m,59,57,"Hello, world",no,no`

    const result = csvImporter.parse(csv)
    expect(result[0].remarks).toBe('Hello, world')
  })

  it('handles escaped quotes', () => {
    const csv = `date,callsign,mode,power,frequency,band,rstSent,rstReceived,remarks,qslSent,qslReceived
2024-03-15T14:30:00.000Z,DL1ABC,SSB,100W,14.200,20m,59,57,"Said ""hi""",no,no`

    const result = csvImporter.parse(csv)
    expect(result[0].remarks).toBe('Said "hi"')
  })

  it('returns empty for header-only CSV', () => {
    const csv = 'date,callsign,mode'
    const result = csvImporter.parse(csv)
    expect(result).toHaveLength(0)
  })

  it('returns empty for empty input', () => {
    expect(csvImporter.parse('')).toHaveLength(0)
  })
})

describe('csvImporter.validate', () => {
  it('passes for valid QSOs', () => {
    const result = csvImporter.validate([
      { callsign: 'DL1ABC', date: '2024-03-15T14:30:00.000Z' },
    ])
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails for missing callsign', () => {
    const result = csvImporter.validate([
      { callsign: '', date: '2024-03-15T14:30:00.000Z' },
    ])
    expect(result.valid).toBe(false)
    expect(result.errors[0].field).toBe('callsign')
  })

  it('fails for missing date', () => {
    const result = csvImporter.validate([
      { callsign: 'DL1ABC', date: '' },
    ])
    expect(result.valid).toBe(false)
    expect(result.errors[0].field).toBe('date')
  })
})

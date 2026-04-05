import { describe, it, expect } from 'vitest'
import { csvStrategy } from '../../../../src/services/export/csvStrategy'
import type { QSO } from '../../../../src/types/qso'

const sampleQso: QSO = {
  id: 1,
  sequenceNumber: 1,
  uuid: 'test-uuid',
  date: '2024-03-15T14:30:00.000Z',
  callsign: 'DL1ABC',
  mode: 'SSB',
  power: '100W',
  frequency: '14.200',
  band: '20m',
  rstSent: '59',
  rstReceived: '57',
  remarks: 'Nice QSO',
  qslSent: 'no',
  qslReceived: 'no',
  operatorId: 0,
  _lastModified: '2024-03-15T14:30:00.000Z',
  _syncStatus: 'pending',
}

describe('csvStrategy', () => {
  it('exports header row', () => {
    const result = csvStrategy.export([], { stationCallsign: '' })
    expect(result).toBe('sequenceNumber,date,callsign,name,country,mode,power,frequency,band,rstSent,rstReceived,locator,myLocator,remarks,qslSent,qslReceived')
  })

  it('exports QSO data', () => {
    const result = csvStrategy.export([sampleQso], { stationCallsign: '' })
    const lines = result.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('DL1ABC')
    expect(lines[1]).toContain('SSB')
    expect(lines[1]).toContain('14.200')
  })

  it('escapes commas in fields', () => {
    const qso = { ...sampleQso, remarks: 'Hello, world' }
    const result = csvStrategy.export([qso], { stationCallsign: '' })
    expect(result).toContain('"Hello, world"')
  })

  it('escapes quotes in fields', () => {
    const qso = { ...sampleQso, remarks: 'Said "hi"' }
    const result = csvStrategy.export([qso], { stationCallsign: '' })
    expect(result).toContain('"Said ""hi"""')
  })

  it('has correct mime type and extension', () => {
    expect(csvStrategy.mimeType).toBe('text/csv')
    expect(csvStrategy.fileExtension).toBe('csv')
  })
})

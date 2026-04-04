import { describe, it, expect } from 'vitest'
import { adifStrategy } from '../../../../src/services/export/adifStrategy'
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
  remarks: 'Contest',
  qslSent: 'yes',
  qslReceived: 'no',
  operatorId: 0,
  _lastModified: '2024-03-15T14:30:00.000Z',
  _syncStatus: 'pending',
}

describe('adifStrategy', () => {
  it('includes ADIF header', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<ADIF_VER:5>3.1.4')
    expect(result).toContain('<PROGRAMID:6>QSOlog')
    expect(result).toContain('<EOH>')
  })

  it('formats QSO date as YYYYMMDD', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<QSO_DATE:8>20240315')
  })

  it('formats QSO time as HHMM', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<TIME_ON:4>1430')
  })

  it('includes callsign and mode', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<CALL:6>DL1ABC')
    expect(result).toContain('<MODE:3>SSB')
  })

  it('maps QSL status correctly', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<QSL_SENT:1>Y')
    expect(result).toContain('<QSL_RCVD:1>N')
  })

  it('ends records with EOR', () => {
    const result = adifStrategy.export([sampleQso], { stationCallsign: '' })
    expect(result).toContain('<EOR>')
  })

  it('has correct mime type and extension', () => {
    expect(adifStrategy.mimeType).toBe('application/adif')
    expect(adifStrategy.fileExtension).toBe('adi')
  })
})

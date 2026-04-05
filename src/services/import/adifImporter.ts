import type { QSO } from '../../types/qso'
import type { ImportStrategy, ValidationResult } from '../../types/export'
import { AdifParser } from 'adif-parser-ts'
import { frequencyToBand } from '../../utils/frequency'

function parseAdifDate(dateStr: string, timeStr?: string): string {
  if (!dateStr || dateStr.length < 8) return ''
  const year = dateStr.slice(0, 4)
  const month = dateStr.slice(4, 6)
  const day = dateStr.slice(6, 8)
  const hours = timeStr?.slice(0, 2) ?? '00'
  const minutes = timeStr?.slice(2, 4) ?? '00'
  return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
}

function mapQslStatus(adifValue?: string): 'yes' | 'no' | 'requested' {
  switch (adifValue?.toUpperCase()) {
    case 'Y': return 'yes'
    case 'R': return 'requested'
    default: return 'no'
  }
}

export const adifImporter: ImportStrategy = {
  parse(content: string): Partial<QSO>[] {
    const parsed = AdifParser.parseAdi(content)
    if (!parsed.records) return []

    return parsed.records.map((record: Record<string, string>) => {
      const freq = record.freq || ''
      const band = record.band || (freq ? frequencyToBand(parseFloat(freq)) : '')

      return {
        date: parseAdifDate(record.qso_date, record.time_on),
        callsign: (record.call || '').toUpperCase(),
        name: record.name || '',
        mode: (record.mode || '').toUpperCase(),
        power: record.tx_pwr || '',
        frequency: freq,
        band,
        locator: record.gridsquare || '',
        myLocator: record.my_gridsquare || '',
        rstSent: record.rst_sent || '59',
        rstReceived: record.rst_rcvd || '59',
        remarks: record.comment || record.notes || '',
        qslSent: mapQslStatus(record.qsl_sent),
        qslReceived: mapQslStatus(record.qsl_rcvd),
      } as Partial<QSO>
    })
  },

  validate(qsos: Partial<QSO>[]): ValidationResult {
    const errors = qsos.flatMap((qso, i) => {
      const rowErrors = []
      if (!qso.callsign) rowErrors.push({ row: i, field: 'callsign', message: 'Missing callsign' })
      if (!qso.date) rowErrors.push({ row: i, field: 'date', message: 'Missing date' })
      return rowErrors
    })
    return { valid: errors.length === 0, errors }
  },
}

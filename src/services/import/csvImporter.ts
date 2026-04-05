import type { QSO } from '../../types/qso'
import type { ImportStrategy, ValidationResult } from '../../types/export'

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

export const csvImporter: ImportStrategy = {
  parse(content: string): Partial<QSO>[] {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return []

    const headers = parseCsvLine(lines[0])
    return lines.slice(1).filter((line) => line.trim()).map((line) => {
      const values = parseCsvLine(line)
      const record: Record<string, string> = {}
      headers.forEach((h, i) => {
        record[h.trim()] = values[i]?.trim() ?? ''
      })

      return {
        date: record.date || '',
        callsign: record.callsign || '',
        name: record.name || '',
        country: record.country || undefined,
        mode: record.mode || '',
        power: record.power || '',
        frequency: record.frequency || '',
        band: record.band || '',
        locator: record.locator || '',
        myLocator: record.myLocator || '',
        rstSent: record.rstSent || '59',
        rstReceived: record.rstReceived || '59',
        remarks: record.remarks || '',
        qslSent: (record.qslSent as 'yes' | 'no' | 'requested') || 'no',
        qslReceived: (record.qslReceived as 'yes' | 'no' | 'requested') || 'no',
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

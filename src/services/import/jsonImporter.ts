import type { QSO } from '../../types/qso'
import type { ImportStrategy, ValidationResult } from '../../types/export'

export const jsonImporter: ImportStrategy = {
  parse(content: string): Partial<QSO>[] {
    const data = JSON.parse(content)
    if (!Array.isArray(data)) return []
    return data
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

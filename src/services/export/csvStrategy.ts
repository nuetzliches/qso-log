import type { QSO } from '../../types/qso'
import type { ExportStrategy, ExportOptions } from '../../types/export'

const CSV_HEADERS = [
  'sequenceNumber', 'date', 'callsign', 'name', 'country', 'mode', 'power', 'frequency',
  'band', 'rstSent', 'rstReceived', 'locator', 'myLocator', 'remarks', 'qslSent', 'qslReceived',
]

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export const csvStrategy: ExportStrategy = {
  mimeType: 'text/csv',
  fileExtension: 'csv',

  export(qsos: QSO[], _options: ExportOptions): string {
    const header = CSV_HEADERS.join(',')
    const rows = qsos.map((qso) =>
      CSV_HEADERS.map((key) => escapeCsv(String(qso[key as keyof QSO] ?? ''))).join(','),
    )
    return [header, ...rows].join('\n')
  },
}

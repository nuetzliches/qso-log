import type { QSO } from '../../types/qso'
import type { ExportFormat, ExportOptions, ExportStrategy } from '../../types/export'
import { csvStrategy } from './csvStrategy'
import { jsonStrategy } from './jsonStrategy'
import { adifStrategy } from './adifStrategy'

const strategies: Record<ExportFormat, ExportStrategy> = {
  csv: csvStrategy,
  json: jsonStrategy,
  adif: adifStrategy,
}

export function exportQsos(qsos: QSO[], options: ExportOptions): void {
  const strategy = strategies[options.format]
  const content = strategy.export(qsos, options)

  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: strategy.mimeType })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `funk-log-export.${strategy.fileExtension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

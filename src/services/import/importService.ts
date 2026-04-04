import type { ExportFormat, ImportResult } from '../../types/export'
import { csvImporter } from './csvImporter'
import { jsonImporter } from './jsonImporter'
import { adifImporter } from './adifImporter'

export function detectFormat(filename: string, content: string): ExportFormat {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'adi' || ext === 'adif') return 'adif'
  if (ext === 'json') return 'json'
  if (ext === 'csv') return 'csv'

  // Content-based detection
  if (content.trim().startsWith('[') || content.trim().startsWith('{')) return 'json'
  if (content.includes('<EOH>') || content.includes('<eoh>')) return 'adif'
  return 'csv'
}

export function parseFile(content: string, format: ExportFormat): ImportResult {
  const importers = { csv: csvImporter, json: jsonImporter, adif: adifImporter }
  const importer = importers[format]

  const qsos = importer.parse(content)
  const validation = importer.validate(qsos)

  return { qsos, validation }
}

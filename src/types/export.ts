import type { QSO } from './qso'

export type ExportFormat = 'csv' | 'json' | 'adif'

export interface ExportOptions {
  format: ExportFormat
  dateFrom?: string
  dateTo?: string
}

export interface ExportStrategy {
  export(qsos: QSO[], options: ExportOptions): string | Blob
  mimeType: string
  fileExtension: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ImportResult {
  qsos: Partial<QSO>[]
  validation: ValidationResult
}

export interface ImportStrategy {
  parse(content: string): Partial<QSO>[]
  validate(qsos: Partial<QSO>[]): ValidationResult
}

import type { QSO } from '../../types/qso'
import type { ExportStrategy, ExportOptions } from '../../types/export'

export const jsonStrategy: ExportStrategy = {
  mimeType: 'application/json',
  fileExtension: 'json',

  export(qsos: QSO[], _options: ExportOptions): string {
    const exportData = qsos.map(({ id, _lastModified, _syncStatus, ...rest }) => rest)
    return JSON.stringify(exportData, null, 2)
  },
}

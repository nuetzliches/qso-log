import { ref } from 'vue'
import { exportQsos } from '../services/export/exportService'
import { detectFormat, parseFile } from '../services/import/importService'
import { qsoRepository } from '../db/repositories/qsoRepository'
import type { QSO, QSOInput } from '../types/qso'
import type { ExportFormat, ImportResult } from '../types/export'

export function useExportImport() {
  const importResult = ref<ImportResult | null>(null)
  const importing = ref(false)

  function doExport(qsos: QSO[], format: ExportFormat) {
    exportQsos(qsos, { format })
  }

  async function prepareImport(file: File): Promise<ImportResult> {
    const content = await file.text()
    const format = detectFormat(file.name, content)
    const result = parseFile(content, format)
    importResult.value = result
    return result
  }

  async function confirmImport(): Promise<number> {
    if (!importResult.value) return 0

    importing.value = true
    let imported = 0

    try {
      for (const qso of importResult.value.qsos) {
        if (!qso.callsign || !qso.date) continue

        const input: QSOInput = {
          date: qso.date,
          callsign: qso.callsign.toUpperCase(),
          mode: qso.mode || '',
          power: qso.power || '',
          frequency: qso.frequency || '',
          band: qso.band || '',
          rstSent: qso.rstSent || '59',
          rstReceived: qso.rstReceived || '59',
          remarks: qso.remarks || '',
          qslSent: qso.qslSent || 'no',
          qslReceived: qso.qslReceived || 'no',
          operatorId: qso.operatorId || 0,
        }

        await qsoRepository.add(input)
        imported++
      }
    } finally {
      importing.value = false
      importResult.value = null
    }

    return imported
  }

  function cancelImport() {
    importResult.value = null
  }

  return {
    importResult,
    importing,
    doExport,
    prepareImport,
    confirmImport,
    cancelImport,
  }
}

import { generatePdfReport, type PdfReportOptions } from '../services/pdf/reportGenerator'
import { useSettingsStore } from '../stores/settingsStore'
import type { QSO } from '../types/qso'

export function usePdfReport() {
  function generate(qsos: QSO[], dateFrom?: string, dateTo?: string) {
    const settings = useSettingsStore()
    const options: PdfReportOptions = {
      stationCallsign: settings.ownCallsign,
      dateFrom,
      dateTo,
    }
    generatePdfReport(qsos, options)
  }

  return { generate }
}

import { generatePdfReport, type PdfReportOptions } from '../services/pdf/reportGenerator'
import { useSettingsStore } from '../stores/settingsStore'
import { useOperatorStore } from '../stores/operatorStore'
import type { QSO } from '../types/qso'

export function usePdfReport() {
  function generate(qsos: QSO[], dateFrom?: string, dateTo?: string) {
    const settings = useSettingsStore()
    const operatorStore = useOperatorStore()
    const options: PdfReportOptions = {
      stationCallsign: settings.ownCallsign,
      dateFrom,
      dateTo,
      operators: operatorStore.operators,
    }
    generatePdfReport(qsos, options)
  }

  return { generate }
}

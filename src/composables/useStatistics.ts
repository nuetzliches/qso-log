import { ref, shallowRef, watch } from 'vue'
import { qsoRepository } from '../db/repositories/qsoRepository'
import { useOperatorStore } from '../stores/operatorStore'
import type { QSO, QSOFilters } from '../types/qso'

export function useStatistics() {
  const qsos = shallowRef<QSO[]>([])
  const loading = ref(false)
  const selectedOperatorId = ref<number | undefined>(undefined)

  const operatorStore = useOperatorStore()

  async function loadQsos() {
    loading.value = true
    try {
      const filters: QSOFilters = {}
      if (selectedOperatorId.value !== undefined) {
        filters.operatorId = selectedOperatorId.value
      }
      const result = await qsoRepository.getAll(filters, { field: 'date', direction: 'asc' })
      qsos.value = result.qsos
    } finally {
      loading.value = false
    }
  }

  watch(selectedOperatorId, () => loadQsos())

  return {
    qsos,
    loading,
    selectedOperatorId,
    operators: operatorStore.operators,
    hasMultipleOperators: operatorStore.hasMultipleOperators,
    loadQsos,
  }
}

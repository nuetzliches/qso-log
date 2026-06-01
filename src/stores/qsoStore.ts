import { defineStore } from 'pinia'
import { ref } from 'vue'
import { qsoRepository } from '../db/repositories/qsoRepository'
import { enrichQso } from '../services/propagation/propagationService'
import { useSettingsStore } from './settingsStore'
import type { QSO, QSOFilters, QSOSort, QSOPagination, QSOInput } from '../types/qso'

export const useQsoStore = defineStore('qsos', () => {
  const qsos = ref<QSO[]>([])
  const recentQsos = ref<QSO[]>([])
  const loading = ref(false)
  const totalCount = ref(0)
  const filters = ref<QSOFilters>({})
  const sort = ref<QSOSort>({ field: 'date', direction: 'desc' })
  const pagination = ref<QSOPagination>({ page: 1, pageSize: 25 })

  async function loadQsos(
    newFilters?: QSOFilters,
    newSort?: QSOSort,
    newPagination?: QSOPagination,
  ) {
    if (newFilters !== undefined) filters.value = newFilters
    if (newSort) sort.value = newSort
    if (newPagination) pagination.value = newPagination

    loading.value = true
    try {
      const result = await qsoRepository.getAll(filters.value, sort.value, pagination.value)
      qsos.value = result.qsos
      totalCount.value = result.totalCount
    } finally {
      loading.value = false
    }
  }

  async function loadRecentQsos() {
    recentQsos.value = await qsoRepository.getRecentQsos(5)
  }

  async function addQso(input: QSOInput): Promise<number> {
    const id = await qsoRepository.add(input)
    await loadRecentQsos()
    // Fire-and-forget: only when the user has consented.
    const settings = useSettingsStore()
    if (settings.propagation.enabled && settings.propagation.consent.granted && input.date) {
      void enrichQso(id, input.date).then(() => {
        // Refresh recent list so the propagation snapshot becomes visible
        return loadRecentQsos()
      })
    }
    return id
  }

  async function updateQso(id: number, changes: Partial<QSO>): Promise<void> {
    await qsoRepository.update(id, changes)
    await loadQsos()
    await loadRecentQsos()
  }

  async function deleteQso(id: number): Promise<void> {
    await qsoRepository.delete(id)
    await loadQsos()
    await loadRecentQsos()
  }

  async function findPreviousContacts(callsign: string): Promise<QSO[]> {
    return qsoRepository.findByCallsign(callsign)
  }

  async function getNextSequenceNumber(): Promise<number> {
    return qsoRepository.getNextSequenceNumber()
  }

  return {
    qsos,
    recentQsos,
    loading,
    totalCount,
    filters,
    sort,
    pagination,
    loadQsos,
    loadRecentQsos,
    addQso,
    updateQso,
    deleteQso,
    findPreviousContacts,
    getNextSequenceNumber,
  }
})

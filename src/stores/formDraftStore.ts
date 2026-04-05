import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QslStatus } from '../types/qso'

export interface QsoDraft {
  date: string
  time: string
  callsign: string
  name: string
  mode: string
  power: string
  frequency: string
  band: string
  rstSent: string
  rstReceived: string
  locator: string
  myLocator: string
  remarks: string
  qslSent: QslStatus
  qslReceived: QslStatus
  operatorId: number
}

export const useFormDraftStore = defineStore('formDraft', () => {
  const draft = ref<QsoDraft | null>(null)
  const hasDraft = computed(() => draft.value !== null)

  function saveDraft(state: QsoDraft) {
    draft.value = { ...state }
  }

  function clearDraft() {
    draft.value = null
  }

  return { draft, hasDraft, saveDraft, clearDraft }
})

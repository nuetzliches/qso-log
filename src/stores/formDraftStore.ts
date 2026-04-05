import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QslStatus } from '../types/qso'

const STORAGE_KEY = 'qso-form-draft'

export interface QsoDraft {
  date: string
  time: string
  callsign: string
  name: string
  country: string
  countryCode: string
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

function loadFromStorage(): QsoDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useFormDraftStore = defineStore('formDraft', () => {
  const draft = ref<QsoDraft | null>(loadFromStorage())
  const hasDraft = computed(() => draft.value !== null)

  function saveDraft(state: QsoDraft) {
    draft.value = { ...state }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft.value))
    } catch {
      // localStorage full or unavailable — in-memory draft still works
    }
  }

  function clearDraft() {
    draft.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { draft, hasDraft, saveDraft, clearDraft }
})

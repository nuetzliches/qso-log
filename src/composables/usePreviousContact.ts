import { ref } from 'vue'
import { useQsoStore } from '../stores/qsoStore'
import type { QSO } from '../types/qso'

export function usePreviousContact() {
  const previousQsos = ref<QSO[]>([])
  const loading = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function lookup(callsign: string) {
    previousQsos.value = []

    if (debounceTimer) clearTimeout(debounceTimer)

    if (!callsign || callsign.length < 3) return

    debounceTimer = setTimeout(async () => {
      loading.value = true
      try {
        const qsoStore = useQsoStore()
        previousQsos.value = await qsoStore.findPreviousContacts(callsign)
      } finally {
        loading.value = false
      }
    }, 300)
  }

  function clear() {
    previousQsos.value = []
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  return { previousQsos, loading, lookup, clear }
}

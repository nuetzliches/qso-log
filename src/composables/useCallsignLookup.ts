import { ref } from 'vue'
import { lookupCallsign } from '../services/callsign/lookupService'
import type { CallsignInfo } from '../types/callsign'

export function useCallsignLookup() {
  const info = ref<CallsignInfo | null>(null)
  const loading = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function lookup(callsign: string) {
    info.value = null

    if (debounceTimer) clearTimeout(debounceTimer)

    if (!callsign || callsign.length < 3) return

    debounceTimer = setTimeout(async () => {
      loading.value = true
      try {
        info.value = await lookupCallsign(callsign)
      } finally {
        loading.value = false
      }
    }, 500)
  }

  function clear() {
    info.value = null
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  return { info, loading, lookup, clear }
}

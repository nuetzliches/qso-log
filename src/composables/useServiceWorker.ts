import { useRegisterSW } from 'virtual:pwa-register/vue'

export function useServiceWorker() {
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  } = useRegisterSW()

  function close() {
    needRefresh.value = false
    offlineReady.value = false
  }

  return { needRefresh, offlineReady, updateServiceWorker, close }
}

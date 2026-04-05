import { useRegisterSW } from 'virtual:pwa-register/vue'

export function useServiceWorker() {
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return

      setInterval(() => registration.update(), 60 * 60 * 1000)

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update()
        }
      })
    },
  })

  function close() {
    needRefresh.value = false
    offlineReady.value = false
  }

  return { needRefresh, offlineReady, updateServiceWorker, close }
}

import { computed, onMounted, onUnmounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

const DISMISS_KEY = 'pwa-install-dismissed'

export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstallable = ref(false)
  const isDismissed = ref(localStorage.getItem(DISMISS_KEY) === '1')

  function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
    isInstallable.value = true
  }

  function handleAppInstalled() {
    deferredPrompt.value = null
    isInstallable.value = false
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  async function promptInstall() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    isInstallable.value = false
  }

  function dismissInstall() {
    isDismissed.value = true
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const showInstallBanner = computed(() => isInstallable.value && !isDismissed.value)
  const canInstall = computed(() => deferredPrompt.value !== null)

  return { showInstallBanner, canInstall, promptInstall, dismissInstall }
}

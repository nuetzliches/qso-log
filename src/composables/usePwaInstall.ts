import { computed, onMounted, onUnmounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstallable = ref(false)
  const isDismissed = ref(false)

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
    isInstallable.value = false
    deferredPrompt.value = null
  }

  const showInstallBanner = computed(() => isInstallable.value && !isDismissed.value)

  return { showInstallBanner, promptInstall, dismissInstall }
}

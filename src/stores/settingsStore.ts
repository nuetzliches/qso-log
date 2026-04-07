import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../i18n'
import { db } from '../db/database'
import type { ThemeMode } from '../types/settings'

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref('de')
  const theme = ref<ThemeMode>('system')
  const ownCallsign = ref('')
  const ownLocator = ref('')
  const qrzApiKey = ref('')
  const hamqthUsername = ref('')
  const hamqthPassword = ref('')

  async function loadSettings() {
    const settings = await db.settings.toArray()
    for (const s of settings) {
      switch (s.key) {
        case 'locale': locale.value = s.value as string; break
        case 'theme': theme.value = s.value as ThemeMode; break
        case 'ownCallsign': ownCallsign.value = s.value as string; break
        case 'ownLocator': ownLocator.value = s.value as string; break
        case 'qrzApiKey': qrzApiKey.value = s.value as string; break
        case 'hamqthUsername': hamqthUsername.value = s.value as string; break
        case 'hamqthPassword': hamqthPassword.value = s.value as string; break
      }
    }
    // Sync i18n locale with loaded settings
    i18n.global.locale.value = locale.value
    applyTheme()
  }

  async function setSetting(key: string, value: unknown) {
    await db.settings.put({ key, value })
    switch (key) {
      case 'locale':
        locale.value = value as string
        i18n.global.locale.value = locale.value
        break
      case 'theme': theme.value = value as ThemeMode; applyTheme(); break
      case 'ownCallsign': ownCallsign.value = value as string; break
      case 'ownLocator': ownLocator.value = value as string; break
      case 'qrzApiKey': qrzApiKey.value = value as string; break
      case 'hamqthUsername': hamqthUsername.value = value as string; break
      case 'hamqthPassword': hamqthPassword.value = value as string; break
    }
  }

  function applyTheme() {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else if (theme.value === 'light') {
      html.classList.remove('dark')
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  // Watch system preference changes when in 'system' mode
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  }

  return {
    locale,
    theme,
    ownCallsign,
    ownLocator,
    qrzApiKey,
    hamqthUsername,
    hamqthPassword,
    loadSettings,
    setSetting,
    applyTheme,
  }
})

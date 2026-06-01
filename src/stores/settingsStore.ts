import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../i18n'
import { db } from '../db/database'
import { PROPAGATION_CONSENT_VERSION, type PropagationSettings, type ThemeMode } from '../types/settings'

const defaultPropagation = (): PropagationSettings => ({
  enabled: false,
  consent: { granted: false, version: PROPAGATION_CONSENT_VERSION },
})

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<'de' | 'en'>('en')
  const theme = ref<ThemeMode>('system')
  const ownCallsign = ref('')
  const ownLocator = ref('')
  const qrzApiKey = ref('')
  const hamqthUsername = ref('')
  const hamqthPassword = ref('')
  const propagation = ref<PropagationSettings>(defaultPropagation())

  async function loadSettings() {
    const settings = await db.settings.toArray()
    let localeFromDB = false
    for (const s of settings) {
      switch (s.key) {
        case 'locale': locale.value = s.value as 'de' | 'en'; localeFromDB = true; break
        case 'theme': theme.value = s.value as ThemeMode; break
        case 'ownCallsign': ownCallsign.value = s.value as string; break
        case 'ownLocator': ownLocator.value = s.value as string; break
        case 'qrzApiKey': qrzApiKey.value = s.value as string; break
        case 'hamqthUsername': hamqthUsername.value = s.value as string; break
        case 'hamqthPassword': hamqthPassword.value = s.value as string; break
        case 'propagation': {
          const stored = s.value as PropagationSettings | undefined
          if (stored && stored.consent) {
            // Re-Consent erforderlich, wenn die Version sich geändert hat
            if (stored.consent.version !== PROPAGATION_CONSENT_VERSION) {
              propagation.value = {
                enabled: false,
                consent: { ...stored.consent, granted: false, version: PROPAGATION_CONSENT_VERSION },
              }
            } else {
              propagation.value = stored
            }
          }
          break
        }
      }
    }
    if (!localeFromDB) {
      const browserLang = navigator.language.split('-')[0]
      const supported = ['de', 'en']
      locale.value = supported.includes(browserLang) ? (browserLang as 'de' | 'en') : 'en'
    }
    i18n.global.locale.value = locale.value
    applyTheme()
  }

  async function setSetting(key: string, value: unknown) {
    await db.settings.put({ key, value })
    switch (key) {
      case 'locale':
        locale.value = value as 'de' | 'en'
        i18n.global.locale.value = locale.value
        break
      case 'theme': theme.value = value as ThemeMode; applyTheme(); break
      case 'ownCallsign': ownCallsign.value = value as string; break
      case 'ownLocator': ownLocator.value = value as string; break
      case 'qrzApiKey': qrzApiKey.value = value as string; break
      case 'hamqthUsername': hamqthUsername.value = value as string; break
      case 'hamqthPassword': hamqthPassword.value = value as string; break
      case 'propagation': propagation.value = value as PropagationSettings; break
    }
  }

  async function grantPropagationConsent() {
    const next: PropagationSettings = {
      enabled: true,
      consent: {
        granted: true,
        grantedAt: new Date().toISOString(),
        version: PROPAGATION_CONSENT_VERSION,
      },
    }
    await setSetting('propagation', next)
  }

  async function revokePropagationConsent() {
    const next: PropagationSettings = {
      enabled: false,
      consent: {
        ...propagation.value.consent,
        granted: false,
        revokedAt: new Date().toISOString(),
        version: PROPAGATION_CONSENT_VERSION,
      },
    }
    await setSetting('propagation', next)
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
    propagation,
    loadSettings,
    setSetting,
    applyTheme,
    grantPropagationConsent,
    revokePropagationConsent,
  }
})

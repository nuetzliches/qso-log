export interface Setting {
  key: string
  value: unknown
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface PropagationConsent {
  granted: boolean
  grantedAt?: string
  revokedAt?: string
  version: number
}

export interface PropagationSettings {
  enabled: boolean
  consent: PropagationConsent
}

export const PROPAGATION_CONSENT_VERSION = 1

export interface AppSettings {
  locale: 'de' | 'en'
  theme: ThemeMode
  ownCallsign: string
  ownLocator: string
  qrzApiKey: string
  hamqthUsername: string
  hamqthPassword: string
  propagation: PropagationSettings
}

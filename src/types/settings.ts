export interface Setting {
  key: string
  value: unknown
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  locale: 'de' | 'en'
  theme: ThemeMode
  ownCallsign: string
  ownLocator: string
  qrzApiKey: string
  hamqthUsername: string
  hamqthPassword: string
}

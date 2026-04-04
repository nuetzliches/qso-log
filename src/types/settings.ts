export interface Setting {
  key: string
  value: unknown
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  locale: string
  theme: ThemeMode
  ownCallsign: string
  qrzApiKey: string
  hamqthUsername: string
  hamqthPassword: string
}

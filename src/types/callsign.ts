export interface CallsignInfo {
  callsign: string
  name?: string
  qth?: string
  country?: string
  locator?: string
  provider: string
}

export interface CallsignLookupProvider {
  name: string
  lookup(callsign: string): Promise<CallsignInfo | null>
  isConfigured(): boolean
}

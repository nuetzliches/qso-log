import type { CallsignInfo, CallsignLookupProvider } from '../../types/callsign'
import { useSettingsStore } from '../../stores/settingsStore'

let sessionKey: string | null = null

async function getSessionKey(apiKey: string): Promise<string | null> {
  if (sessionKey) return sessionKey

  try {
    const response = await fetch(
      `https://xmldata.qrz.com/xml/current/?username=${encodeURIComponent(apiKey)}&password=&agent=funk-log-0.1`,
    )
    const text = await response.text()
    const match = text.match(/<Key>([^<]+)<\/Key>/)
    if (match) {
      sessionKey = match[1]
      return sessionKey
    }
  } catch {
    // Offline or API error
  }
  return null
}

export const qrzProvider: CallsignLookupProvider = {
  name: 'QRZ.com',

  isConfigured(): boolean {
    const settings = useSettingsStore()
    return !!settings.qrzApiKey
  },

  async lookup(callsign: string): Promise<CallsignInfo | null> {
    const settings = useSettingsStore()
    if (!settings.qrzApiKey) return null

    const key = await getSessionKey(settings.qrzApiKey)
    if (!key) return null

    try {
      const response = await fetch(
        `https://xmldata.qrz.com/xml/current/?s=${key}&callsign=${encodeURIComponent(callsign)}`,
      )
      const text = await response.text()

      const getName = (xml: string) => xml.match(/<fname>([^<]*)<\/fname>/)?.[1] ?? ''
      const getLastName = (xml: string) => xml.match(/<name>([^<]*)<\/name>/)?.[1] ?? ''
      const getQth = (xml: string) => xml.match(/<addr2>([^<]*)<\/addr2>/)?.[1] ?? ''
      const getCountry = (xml: string) => xml.match(/<country>([^<]*)<\/country>/)?.[1] ?? ''
      const getLocator = (xml: string) => xml.match(/<grid>([^<]*)<\/grid>/)?.[1] ?? ''

      const fullName = [getName(text), getLastName(text)].filter(Boolean).join(' ')

      if (!fullName && !getQth(text)) return null

      return {
        callsign,
        name: fullName,
        qth: getQth(text),
        country: getCountry(text),
        locator: getLocator(text),
        provider: 'QRZ.com',
      }
    } catch {
      return null
    }
  },
}

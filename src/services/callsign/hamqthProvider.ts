import type { CallsignInfo, CallsignLookupProvider } from '../../types/callsign'
import { useSettingsStore } from '../../stores/settingsStore'

let sessionId: string | null = null

async function getSession(username: string, password: string): Promise<string | null> {
  if (sessionId) return sessionId

  try {
    const response = await fetch(
      `https://www.hamqth.com/xml.php?u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`,
    )
    const text = await response.text()
    const match = text.match(/<session_id>([^<]+)<\/session_id>/)
    if (match) {
      sessionId = match[1]
      return sessionId
    }
  } catch {
    // Offline or API error
  }
  return null
}

export const hamqthProvider: CallsignLookupProvider = {
  name: 'HamQTH',

  isConfigured(): boolean {
    const settings = useSettingsStore()
    return !!settings.hamqthUsername && !!settings.hamqthPassword
  },

  async lookup(callsign: string): Promise<CallsignInfo | null> {
    const settings = useSettingsStore()
    if (!settings.hamqthUsername || !settings.hamqthPassword) return null

    const sid = await getSession(settings.hamqthUsername, settings.hamqthPassword)
    if (!sid) return null

    try {
      const response = await fetch(
        `https://www.hamqth.com/xml.php?id=${sid}&callsign=${encodeURIComponent(callsign)}&prg=QSOlog`,
      )
      const text = await response.text()

      const getName = (xml: string) => xml.match(/<nick>([^<]*)<\/nick>/)?.[1] ?? xml.match(/<adr_name>([^<]*)<\/adr_name>/)?.[1] ?? ''
      const getQth = (xml: string) => xml.match(/<qth>([^<]*)<\/qth>/)?.[1] ?? ''
      const getCountry = (xml: string) => xml.match(/<country>([^<]*)<\/country>/)?.[1] ?? ''
      const getLocator = (xml: string) => xml.match(/<grid>([^<]*)<\/grid>/)?.[1] ?? ''

      const name = getName(text)
      if (!name && !getQth(text)) return null

      return {
        callsign,
        name,
        qth: getQth(text),
        country: getCountry(text),
        locator: getLocator(text),
        provider: 'HamQTH',
      }
    } catch {
      return null
    }
  },
}

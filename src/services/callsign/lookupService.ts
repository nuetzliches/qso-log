import type { CallsignInfo, CallsignLookupProvider } from '../../types/callsign'
import { qrzProvider } from './qrzProvider'
import { hamqthProvider } from './hamqthProvider'

const providers: CallsignLookupProvider[] = [qrzProvider, hamqthProvider]

export async function lookupCallsign(callsign: string): Promise<CallsignInfo | null> {
  if (!navigator.onLine) return null

  for (const provider of providers) {
    if (provider.isConfigured()) {
      const result = await provider.lookup(callsign)
      if (result) return result
    }
  }

  return null
}

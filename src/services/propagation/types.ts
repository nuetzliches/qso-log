export type PropagationSource = 'live' | 'cached' | 'historical'

/**
 * Snapshot of solar and geomagnetic conditions at a given UTC hour.
 */
export interface Propagation {
  sfi?: number
  ssn?: number
  kIndex?: number
  aIndex?: number
  source: PropagationSource
  fetchedAt: string
}

/**
 * Cache row keyed by UTC hour, e.g. '2026-04-28T13'.
 */
export interface PropagationCacheEntry extends Propagation {
  utcHour: string
}

export class PropagationOfflineError extends Error {
  constructor() {
    super('Propagation provider is offline')
    this.name = 'PropagationOfflineError'
  }
}

export class PropagationFetchError extends Error {
  readonly cause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'PropagationFetchError'
    this.cause = cause
  }
}

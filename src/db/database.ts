import Dexie, { type Table } from 'dexie'
import type { QSO } from '../types/qso'
import type { Operator } from '../types/operator'
import type { Setting } from '../types/settings'
import type { PropagationCacheEntry } from '../services/propagation/types'

export class FunkLogDB extends Dexie {
  qsos!: Table<QSO, number>
  operators!: Table<Operator, number>
  settings!: Table<Setting, string>
  propagationCache!: Table<PropagationCacheEntry, string>

  constructor() {
    super('funklog')

    this.version(1).stores({
      qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]',
      operators: '++id, uuid, callsign',
      settings: 'key',
    })

    // v2: Added locator field to QSO (no index change needed, Dexie stores all properties)
    this.version(2).stores({
      qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]',
      operators: '++id, uuid, callsign',
      settings: 'key',
    })

    // v3: Added country/countryCode fields to QSO (no index change needed)
    this.version(3).stores({
      qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]',
      operators: '++id, uuid, callsign',
      settings: 'key',
    })

    // v4: Added updatedAt field to QSO (no index change needed)
    this.version(4).stores({
      qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]',
      operators: '++id, uuid, callsign',
      settings: 'key',
    })

    // v5: Added propagation snapshot to QSO + propagationCache table (keyed by UTC hour 'YYYY-MM-DDTHH')
    this.version(5).stores({
      qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]',
      operators: '++id, uuid, callsign',
      settings: 'key',
      propagationCache: 'utcHour',
    })

    this.qsos.hook('creating', (_primKey, obj) => {
      if (!obj.uuid) {
        obj.uuid = crypto.randomUUID()
      }
      obj._lastModified = Date.now()
      obj._syncStatus = 'pending'
    })

    this.qsos.hook('updating', (modifications) => {
      return {
        ...modifications,
        _lastModified: Date.now(),
        _syncStatus: 'pending' as const,
      }
    })

    this.operators.hook('creating', (_primKey, obj) => {
      if (!obj.uuid) {
        obj.uuid = crypto.randomUUID()
      }
    })
  }
}

export const db = new FunkLogDB()

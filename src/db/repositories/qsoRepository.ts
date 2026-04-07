import { db } from '../database'
import type { QSO, QSOFilters, QSOSort, QSOPagination, QSOInput } from '../../types/qso'

export const qsoRepository = {
  async add(input: QSOInput): Promise<number> {
    const sequenceNumber = await this.getNextSequenceNumber()
    return db.qsos.add({
      ...input,
      sequenceNumber,
      uuid: crypto.randomUUID(),
      _lastModified: Date.now(),
      _syncStatus: 'pending',
    } as QSO)
  },

  async update(id: number, changes: Partial<QSO>): Promise<void> {
    await db.qsos.update(id, { ...changes, updatedAt: Date.now() })
  },

  async delete(id: number): Promise<void> {
    await db.qsos.delete(id)
  },

  async getById(id: number): Promise<QSO | undefined> {
    return db.qsos.get(id)
  },

  async getAll(
    filters?: QSOFilters,
    sort: QSOSort = { field: 'date', direction: 'desc' },
    pagination?: QSOPagination,
  ): Promise<{ qsos: QSO[]; totalCount: number }> {
    let collection = db.qsos.toCollection()

    if (filters) {
      collection = db.qsos.filter((qso) => {
        if (filters.callsign && !qso.callsign.toLowerCase().includes(filters.callsign.toLowerCase())) {
          return false
        }
        if (filters.dateFrom && qso.date < filters.dateFrom) {
          return false
        }
        if (filters.dateTo && qso.date > filters.dateTo) {
          return false
        }
        if (filters.modes && filters.modes.length > 0 && !filters.modes.includes(qso.mode)) {
          return false
        }
        if (filters.bands && filters.bands.length > 0 && !filters.bands.includes(qso.band)) {
          return false
        }
        if (filters.operatorId !== undefined && qso.operatorId !== filters.operatorId) {
          return false
        }
        return true
      })
    }

    const allResults = await collection.sortBy(sort.field as string)
    if (sort.direction === 'desc') {
      allResults.reverse()
    }

    const totalCount = allResults.length

    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize
      return {
        qsos: allResults.slice(start, start + pagination.pageSize),
        totalCount,
      }
    }

    return { qsos: allResults, totalCount }
  },

  async findByCallsign(callsign: string, limit: number = 5): Promise<QSO[]> {
    const results = await db.qsos
      .where('callsign')
      .equals(callsign.toUpperCase())
      .reverse()
      .sortBy('date')
    return results.slice(0, limit)
  },

  async getNextSequenceNumber(): Promise<number> {
    const last = await db.qsos.orderBy('sequenceNumber').last()
    return last ? last.sequenceNumber + 1 : 1
  },

  async findDuplicates(date: string, callsign: string, band: string): Promise<QSO[]> {
    return db.qsos
      .where('[band+mode]')
      .between([band, Dexie.minKey], [band, Dexie.maxKey])
      .filter((qso) => qso.callsign.toUpperCase() === callsign.toUpperCase() && qso.date === date)
      .toArray()
  },

  async getRecentQsos(limit: number = 5): Promise<QSO[]> {
    return db.qsos.orderBy('sequenceNumber').reverse().limit(limit).toArray()
  },

  async count(): Promise<number> {
    return db.qsos.count()
  },
}

// Re-export Dexie for use in findDuplicates
import Dexie from 'dexie'

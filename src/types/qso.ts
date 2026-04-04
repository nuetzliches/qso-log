export type QslStatus = 'yes' | 'no' | 'requested'
export type SyncStatus = 'synced' | 'pending' | 'conflict'

export interface QSO {
  id?: number
  uuid: string
  sequenceNumber: number
  date: string
  callsign: string
  name?: string
  mode: string
  power: string
  frequency: string
  band: string
  rstSent: string
  rstReceived: string
  remarks: string
  qslSent: QslStatus
  qslReceived: QslStatus
  operatorId: number
  _lastModified: number
  _syncStatus: SyncStatus
}

export type QSOInput = Omit<QSO, 'id' | 'uuid' | 'sequenceNumber' | '_lastModified' | '_syncStatus'>

export interface QSOFilters {
  callsign?: string
  dateFrom?: string
  dateTo?: string
  modes?: string[]
  bands?: string[]
  operatorId?: number
}

export interface QSOSort {
  field: keyof QSO
  direction: 'asc' | 'desc'
}

export interface QSOPagination {
  page: number
  pageSize: number
}

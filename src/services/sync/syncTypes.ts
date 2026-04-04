import type { QSO } from '../../types/qso'

export interface SyncResult {
  pushed: number
  pulled: number
  conflicts: SyncConflict[]
}

export interface SyncConflict {
  localRecord: QSO
  remoteRecord: QSO
  resolvedWith: 'local' | 'remote' | 'manual'
}

export interface ConflictResolutionStrategy {
  resolve(local: QSO, remote: QSO): QSO
}

export interface SyncService {
  push(): Promise<SyncResult>
  pull(): Promise<SyncResult>
  sync(): Promise<SyncResult>
  getStatus(): Promise<{ pendingCount: number; lastSyncAt: string | null }>
}

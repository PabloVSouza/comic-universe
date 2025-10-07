import { PlatformPath } from 'path'
import { ElectronAPI } from '@electron-toolkit/preload'
import { IDBInteractionsRepository } from 'repositories/Implementations/DBImplementations/IDBInteractionsRepository'
import { ComicUniverseAPI } from './ApiTypes'

interface ExtendedElectronAPI extends ElectronAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

declare global {
  interface Window {
    Electron: ExtendedElectronAPI
    api: ComicUniverseAPI
    path: PlatformPath
    app: {
      version: string
      description: string
      repository: string
      license: string
      author: string
      path: string
    }
    db: IDBInteractionsRepository
    isDev: boolean
  }

  interface IChangelogEntry {
    id?: string
    userId: string
    entityType: 'comic' | 'chapter' | 'readProgress' | 'sync'
    entityId: string
    action: 'created' | 'updated' | 'deleted' | 'sync_started' | 'sync_completed' | 'sync_failed'
    data?: unknown
    createdAt?: string
    synced?: boolean
  }

  interface SyncMetadata {
    syncId: string
    direction: 'app_to_cloud' | 'cloud_to_app' | 'bidirectional'
    entriesProcessed?: number
    conflicts?: number
    errors?: string[]
    duration?: number
    lastSyncTimestamp?: string
  }

  type ChangelogEntry = IChangelogEntry

  interface Changelog {
    entries: ChangelogEntry[]
    lastSyncTimestamp?: string
  }

  interface SyncChangelogRequest {
    token: string
    changelog: ChangelogEntry[]
    lastSyncTimestamp?: string
  }

  interface SyncChangelogResponse {
    message: string
    syncedEntriesCount: number
    newChangelog?: ChangelogEntry[]
  }
}

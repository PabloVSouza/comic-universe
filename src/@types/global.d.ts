// src/@types/global.d.ts

declare global {
  type FC<P = {}> = import('react').FC<P>

  // Changelog types
  interface IChangelogEntry {
    id?: string
    userId: string
    entityType: 'comic' | 'chapter' | 'readProgress' | 'sync'
    entityId: string // ID of the entity, or 'sync' for sync events
    action: 'created' | 'updated' | 'deleted' | 'sync_started' | 'sync_completed' | 'sync_failed'
    data?: any // JSON data of the changed entity or sync metadata
    createdAt?: string
    synced?: boolean
  }

  interface SyncMetadata {
    syncId: string
    direction: 'app_to_cloud' | 'cloud_to_app' | 'bidirectional'
    entriesProcessed?: number
    conflicts?: number
    errors?: string[]
    duration?: number // in milliseconds
    lastSyncTimestamp?: string
  }
}

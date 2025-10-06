declare global {
  type FC<P = {}> = import('react').FC<P>

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
}

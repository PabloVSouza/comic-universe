// Sync service types

declare global {
  // Sync direction
  type SyncDirection = 'push' | 'pull' | 'bidirectional'

  // Changelog diff - represents what needs to be synced
  interface ChangelogDiff {
    toCreate: {
      comics: IComic[]
      chapters: IChapter[]
      readProgress: IReadProgress[]
    }
    toUpdate: {
      comics: IComic[]
      chapters: IChapter[]
      readProgress: IReadProgress[]
    }
    toDelete: {
      comicIds: string[]
      chapterIds: string[]
      readProgressIds: string[]
    }
  }

  // Sync conflict - when same entity modified in both places
  interface SyncConflict {
    entityType: 'comic' | 'chapter' | 'readProgress'
    entityId: string
    localUpdatedAt: string
    remoteUpdatedAt: string
    resolution: 'local' | 'remote' // latest-wins
  }

  // Sync result
  interface SyncResult {
    success: boolean
    direction: SyncDirection
    entriesProcessed: number
    conflicts: SyncConflict[]
    errors: string[]
    duration: number
    timestamp: string
  }

  // Sync state for storing last sync info
  interface SyncState {
    lastSyncTimestamp: string | null
    lastSyncDirection: SyncDirection | null
    inProgress: boolean
  }

  // Request/Response for API
  interface SyncRequest {
    token: string
    entries: IChangelogEntry[]
    lastSyncTimestamp?: string
  }

  interface SyncResponse {
    success: boolean
    processedEntries: number
    conflicts: Array<{
      entry: IChangelogEntry
      error: string
    }>
    syncedEntryIds: string[]
    serverEntries: IChangelogEntry[]
  }
}

export {}


declare global {
  type SyncDirection = 'push' | 'pull' | 'bidirectional'

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

  interface SyncConflict {
    entityType: 'comic' | 'chapter' | 'readProgress'
    entityId: string
    localUpdatedAt: string
    remoteUpdatedAt: string
    resolution: 'local' | 'remote'
  }

  interface SyncResult {
    success: boolean
    direction: SyncDirection
    entriesProcessed: number
    conflicts: SyncConflict[]
    errors: string[]
    duration: number
    timestamp: string
  }

  interface SyncState {
    lastSyncTimestamp: string | null
    lastSyncDirection: SyncDirection | null
    inProgress: boolean
  }

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

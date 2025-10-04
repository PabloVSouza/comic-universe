/**
 * Sync Service
 *
 * Handles bidirectional synchronization between local database and cloud.
 * Uses changelog-based approach to track and merge changes.
 */

import DebugLogger from 'electron-utils/DebugLogger'
import { generateChangelogDiff, validateEntityData } from 'electron-utils/sync/changelogDiff'
import { IDatabaseRepository } from '../repositories/database/interfaces/IDatabaseRepository'

export interface SyncServiceConfig {
  apiBaseUrl: string
  syncInterval?: number // Auto-sync interval in milliseconds (0 = manual only)
}

export class SyncService {
  private db: IDatabaseRepository
  private config: SyncServiceConfig
  private syncInProgress = false
  private lastSyncTimestamp: string | null = null
  private syncTimer: NodeJS.Timeout | null = null

  constructor(db: IDatabaseRepository, config: SyncServiceConfig) {
    this.db = db
    this.config = config
  }

  /**
   * Start auto-sync if configured
   */
  start(): void {
    if (this.config.syncInterval && this.config.syncInterval > 0) {
      this.syncTimer = setInterval(() => {
        this.sync('bidirectional').catch((error) => {
          DebugLogger.error('Auto-sync failed:', error)
        })
      }, this.config.syncInterval)
      DebugLogger.info(`Auto-sync started with ${this.config.syncInterval}ms interval`)
    }
  }

  /**
   * Stop auto-sync
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
      DebugLogger.info('Auto-sync stopped')
    }
  }

  /**
   * Main sync function
   */
  async sync(direction: SyncDirection, userId?: string, token?: string): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    const startTime = Date.now()
    this.syncInProgress = true

    try {
      // Get user and token if not provided
      if (!userId || !token) {
        const defaultUser = await this.db.getDefaultUser()
        if (!defaultUser || !defaultUser.id) {
          throw new Error('No user found. Please log in first.')
        }
        userId = defaultUser.id
        token = defaultUser.websiteAuthToken || ''

        if (!token) {
          throw new Error('No authentication token found. Please log in to the website.')
        }
      }

      // At this point, userId and token are guaranteed to be strings
      const syncUserId = userId as string
      const syncToken = token as string

      // Log sync start
      await this.db.createChangelogEntry({
        userId: syncUserId,
        entityType: 'sync',
        entityId: 'sync',
        action: 'sync_started',
        data: {
          syncId: crypto.randomUUID(),
          direction,
          timestamp: new Date().toISOString()
        }
      })

      let result: SyncResult

      switch (direction) {
        case 'push':
          result = await this.pushToCloud(syncUserId, syncToken)
          break
        case 'pull':
          result = await this.pullFromCloud(syncUserId, syncToken)
          break
        case 'bidirectional':
          result = await this.bidirectionalSync(syncUserId, syncToken)
          break
        default:
          throw new Error(`Invalid sync direction: ${direction}`)
      }

      this.lastSyncTimestamp = new Date().toISOString()
      result.duration = Date.now() - startTime
      result.timestamp = this.lastSyncTimestamp

      // Log sync completion
      await this.db.createChangelogEntry({
        userId: syncUserId,
        entityType: 'sync',
        entityId: 'sync',
        action: 'sync_completed',
        data: {
          syncId: crypto.randomUUID(),
          syncDirection: direction,
          entriesProcessed: result.entriesProcessed,
          conflicts: result.conflicts.length,
          errors: result.errors,
          duration: result.duration
        }
      })

      DebugLogger.info('Sync completed:', result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Log sync failure
      if (userId) {
        await this.db.createChangelogEntry({
          userId,
          entityType: 'sync',
          entityId: 'sync',
          action: 'sync_failed',
          data: {
            syncId: crypto.randomUUID(),
            direction,
            error: errorMessage,
            timestamp: new Date().toISOString()
          }
        })
      }

      DebugLogger.error('Sync failed:', error)
      throw error
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Push local changes to cloud
   */
  private async pushToCloud(userId: string, token: string): Promise<SyncResult> {
    const conflicts: SyncConflict[] = []
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // Get unsynced local changelog entries
      const unsyncedEntries = await this.db.getUnsyncedChangelogEntries(userId)

      if (unsyncedEntries.length === 0) {
        return {
          success: true,
          direction: 'push',
          entriesProcessed: 0,
          conflicts: [],
          errors: [],
          duration: 0,
          timestamp: new Date().toISOString()
        }
      }

      // Send to server
      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/database-changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          entries: unsyncedEntries,
          lastSyncTimestamp: this.lastSyncTimestamp
        } as SyncRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SyncResponse = await response.json()

      // Mark local entries as synced
      if (data.syncedEntryIds && data.syncedEntryIds.length > 0) {
        await this.db.markChangelogEntriesAsSynced(data.syncedEntryIds)
        entriesProcessed = data.syncedEntryIds.length
      }

      // Process conflicts
      if (data.conflicts && data.conflicts.length > 0) {
        errors.push(...data.conflicts.map((c) => c.error))
      }

      return {
        success: true,
        direction: 'push',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)

      return {
        success: false,
        direction: 'push',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Pull changes from cloud
   */
  private async pullFromCloud(userId: string, token: string): Promise<SyncResult> {
    const conflicts: SyncConflict[] = []
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // Request server changes
      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/database-changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          entries: [], // Empty - we're just pulling
          lastSyncTimestamp: this.lastSyncTimestamp
        } as SyncRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SyncResponse = await response.json()

      // Apply server entries locally
      if (data.serverEntries && data.serverEntries.length > 0) {
        for (const entry of data.serverEntries) {
          try {
            await this.applyChangelogEntry(entry, userId)
            entriesProcessed++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            errors.push(`Failed to apply ${entry.entityType} ${entry.action}: ${errorMessage}`)
          }
        }
      }

      return {
        success: errors.length === 0,
        direction: 'pull',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)

      return {
        success: false,
        direction: 'pull',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Bidirectional sync - push and pull
   */
  private async bidirectionalSync(userId: string, token: string): Promise<SyncResult> {
    const conflicts: SyncConflict[] = []
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // Get local unsynced entries
      const localEntries = await this.db.getUnsyncedChangelogEntries(userId)

      // Send local changes and get server changes
      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/database-changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          entries: localEntries,
          lastSyncTimestamp: this.lastSyncTimestamp
        } as SyncRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SyncResponse = await response.json()

      // Mark local entries as synced
      if (data.syncedEntryIds && data.syncedEntryIds.length > 0) {
        await this.db.markChangelogEntriesAsSynced(data.syncedEntryIds)
        entriesProcessed += data.syncedEntryIds.length
      }

      // Apply server changes locally
      if (data.serverEntries && data.serverEntries.length > 0) {
        const { conflicts: detectedConflicts } = generateChangelogDiff(
          localEntries,
          data.serverEntries
        )
        conflicts.push(...detectedConflicts)

        for (const entry of data.serverEntries) {
          try {
            await this.applyChangelogEntry(entry, userId)
            entriesProcessed++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            errors.push(`Failed to apply ${entry.entityType} ${entry.action}: ${errorMessage}`)
          }
        }
      }

      // Process conflicts
      if (data.conflicts && data.conflicts.length > 0) {
        errors.push(...data.conflicts.map((c) => c.error))
      }

      return {
        success: errors.length === 0,
        direction: 'bidirectional',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)

      return {
        success: false,
        direction: 'bidirectional',
        entriesProcessed,
        conflicts,
        errors,
        duration: 0,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Apply a changelog entry to the local database
   */
  private async applyChangelogEntry(entry: IChangelogEntry, userId: string): Promise<void> {
    if (entry.entityType === 'sync') return // Skip sync metadata

    if (!entry.data) {
      throw new Error(`No data in changelog entry for ${entry.entityType} ${entry.entityId}`)
    }

    // Validate data
    if (!validateEntityData(entry.entityType, entry.data)) {
      throw new Error(`Invalid data for ${entry.entityType}`)
    }

    switch (entry.entityType) {
      case 'comic':
        await this.applyComicChange(entry, userId)
        break
      case 'chapter':
        await this.applyChapterChange(entry)
        break
      case 'readProgress':
        await this.applyReadProgressChange(entry, userId)
        break
    }

    // Create local changelog entry (mark as synced)
    await this.db.createChangelogEntry({
      ...entry,
      userId,
      synced: true
    })
  }

  /**
   * Apply comic changes
   */
  private async applyComicChange(entry: IChangelogEntry, userId: string): Promise<void> {
    const comic = entry.data as IComic

    switch (entry.action) {
      case 'created':
      case 'updated': {
        if (!comic.id) throw new Error('Comic ID is required')
        const existing = await this.db.getComicById(comic.id)
        if (existing) {
          await this.db.updateComic(comic.id, comic)
        } else {
          // Create comic without chapters (they'll be synced separately)
          await this.db.createComic({ ...comic, userId }, [], comic.repo, userId)
        }
        break
      }
      case 'deleted':
        await this.db.deleteComic(entry.entityId)
        break
    }
  }

  /**
   * Apply chapter changes
   */
  private async applyChapterChange(entry: IChangelogEntry): Promise<void> {
    const chapter = entry.data as IChapter

    switch (entry.action) {
      case 'created':
      case 'updated': {
        if (!chapter.id) throw new Error('Chapter ID is required')
        const existing = await this.db.getChapterById(chapter.id)
        if (existing) {
          await this.db.updateChapter(chapter.id, chapter)
        } else {
          await this.db.createChapter(chapter)
        }
        break
      }
      case 'deleted':
        await this.db.deleteChapter(entry.entityId)
        break
    }
  }

  /**
   * Apply read progress changes
   */
  private async applyReadProgressChange(entry: IChangelogEntry, userId: string): Promise<void> {
    const progress = entry.data as IReadProgress

    switch (entry.action) {
      case 'created':
      case 'updated': {
        const existing = await this.db.getReadProgressByUser(userId)
        const existingProgress = existing.find(
          (p) => p.chapterId === progress.chapterId && p.userId === userId
        )

        if (existingProgress) {
          // Only update if server version is newer
          const serverTime = new Date(progress.updatedAt || 0).getTime()
          const localTime = new Date(existingProgress.updatedAt || 0).getTime()

          if (serverTime > localTime) {
            await this.db.updateReadProgress(existingProgress.id!, progress)
          }
        } else {
          await this.db.createReadProgress(progress)
        }
        break
      }
      case 'deleted': {
        const existing = await this.db.getReadProgressByUser(userId)
        const progressToDelete = existing.find((p) => p.id === entry.entityId)
        if (progressToDelete && progressToDelete.id) {
          await this.db.deleteReadProgress(progressToDelete.id)
        }
        break
      }
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncState {
    return {
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastSyncDirection: null, // Could be tracked if needed
      inProgress: this.syncInProgress
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(): string | null {
    return this.lastSyncTimestamp
  }

  /**
   * Check if sync is in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress
  }
}

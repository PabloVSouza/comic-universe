/**
 * Sync Service
 *
 * Handles bidirectional synchronization between local database and cloud.
 * Uses changelog-based approach to track and merge changes.
 */

import DebugLogger from 'electron-utils/DebugLogger'
import { generateChangelogDiff, validateEntityData } from 'electron-utils/ChangelogDiff'
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
          throw new Error(
            'No default user found. Please ensure you are logged in and have set a default user.'
          )
        }
        userId = defaultUser.id
        token = defaultUser.websiteAuthToken || ''

        if (!token) {
          throw new Error(
            'No authentication token found. Please connect your app to your website account.'
          )
        }
      }

      // At this point, userId and token are guaranteed to be strings
      const syncUserId = userId as string
      const syncToken = token as string

      // Get website user ID once for the entire sync
      const websiteUserId = await this.getWebsiteUserId(syncToken)

      // Store website user ID for reference (optional, for caching)
      const defaultUser = await this.db.getDefaultUser()
      if (defaultUser && defaultUser.websiteUserId !== websiteUserId) {
        await this.db.updateUser(syncUserId, { websiteUserId })
      }

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
          result = await this.pushToCloud(syncUserId, syncToken, websiteUserId)
          break
        case 'pull':
          result = await this.pullFromCloud(syncUserId, syncToken)
          break
        case 'bidirectional':
          result = await this.bidirectionalSync(syncUserId, syncToken, websiteUserId)
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
   * Get website user ID from token
   */
  private async getWebsiteUserId(token: string): Promise<string> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/auth/verify-app-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      throw new Error('Failed to verify token and get website user ID')
    }

    const data = await response.json()
    return data.user.id
  }

  /**
   * Push local changes to cloud
   */
  private async pushToCloud(
    userId: string,
    token: string,
    websiteUserId: string
  ): Promise<SyncResult> {
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

      // Remap entries to use website user ID
      const remappedEntries = unsyncedEntries.map((entry) => ({
        ...entry,
        userId: websiteUserId
      }))

      // Send to server
      const requestBody: SyncRequest = {
        token,
        entries: remappedEntries
      }

      if (this.lastSyncTimestamp) {
        requestBody.lastSyncTimestamp = this.lastSyncTimestamp
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
      const requestBody: SyncRequest = {
        token,
        entries: [] // Empty - we're just pulling
      }

      // Only include lastSyncTimestamp if it exists
      if (this.lastSyncTimestamp) {
        requestBody.lastSyncTimestamp = this.lastSyncTimestamp
      }

      DebugLogger.info('Pull sync - Request body:', requestBody)

      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        DebugLogger.error('Pull sync - Server error:', errorData)
        const errorMessage = errorData.details
          ? `${errorData.error}: ${JSON.stringify(errorData.details)}`
          : errorData.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data: SyncResponse = await response.json()

      // Apply server entries locally
      if (data.serverEntries && data.serverEntries.length > 0) {
        // Sort entries by dependency order: comics -> chapters -> readProgress
        const sortedEntries = this.sortEntriesByDependency(data.serverEntries)

        for (const entry of sortedEntries) {
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
  private async bidirectionalSync(
    userId: string,
    token: string,
    websiteUserId: string
  ): Promise<SyncResult> {
    const conflicts: SyncConflict[] = []
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // Get local unsynced entries
      const localEntries = await this.db.getUnsyncedChangelogEntries(userId)

      // Remap entries to use website user ID
      const remappedEntries = localEntries.map((entry) => ({
        ...entry,
        userId: websiteUserId
      }))

      // Send local changes and get server changes
      const requestBody: SyncRequest = {
        token,
        entries: remappedEntries
      }

      if (this.lastSyncTimestamp) {
        requestBody.lastSyncTimestamp = this.lastSyncTimestamp
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/sync/changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
        DebugLogger.info(`Applying ${data.serverEntries.length} server entries locally`)

        const { conflicts: detectedConflicts } = generateChangelogDiff(
          localEntries,
          data.serverEntries
        )
        conflicts.push(...detectedConflicts)

        // Sort entries by dependency order: comics -> chapters -> readProgress
        const sortedEntries = this.sortEntriesByDependency(data.serverEntries)

        // Log the sorted order for debugging
        DebugLogger.info('Sorted entries order:')
        sortedEntries.forEach((entry, index) => {
          const entityId =
            entry.entityType === 'comic'
              ? (entry.data as IComic)?.id
              : entry.entityType === 'chapter'
                ? `${(entry.data as IChapter)?.id} (comicId: ${(entry.data as IChapter)?.comicId})`
                : entry.entityId
          DebugLogger.info(`  ${index + 1}. ${entry.entityType} ${entry.action}: ${entityId}`)
        })

        for (const entry of sortedEntries) {
          try {
            DebugLogger.info(
              `Applying ${entry.entityType} ${entry.action} for entity ${entry.entityId}`
            )
            await this.applyChangelogEntry(entry, userId)
            entriesProcessed++
            DebugLogger.info(`Successfully applied ${entry.entityType} ${entry.entityId}`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            const errorStack = error instanceof Error ? error.stack : ''
            console.error(`❌ Failed to apply ${entry.entityType} ${entry.action}:`, error)
            console.error('Full error:', errorMessage)
            console.error('Stack:', errorStack)
            DebugLogger.error(`Failed to apply ${entry.entityType} ${entry.action}:`, errorMessage)
            errors.push(`Failed to process ${entry.entityType} change: ${errorMessage}`)

            // If it's a chapter error, log the chapter data
            if (entry.entityType === 'chapter') {
              console.error('Chapter data:', JSON.stringify(entry.data, null, 2))
            }
          }
        }
      } else {
        DebugLogger.info('No server entries to apply')
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
   * Sort changelog entries by dependency order
   * Comics must be created before chapters, chapters before read progress
   */
  private sortEntriesByDependency(entries: IChangelogEntry[]): IChangelogEntry[] {
    const priority: Record<string, number> = {
      comic: 1,
      chapter: 2,
      readProgress: 3,
      sync: 4
    }

    return [...entries].sort((a, b) => {
      const priorityA = priority[a.entityType] || 999
      const priorityB = priority[b.entityType] || 999

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Within same entity type, sort by createdAt timestamp
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      return timeA - timeB
    })
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
        await this.applyComicChange(entry)
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
  private async applyComicChange(entry: IChangelogEntry): Promise<void> {
    const comic = entry.data as IComic

    DebugLogger.info(`Applying comic change: ${entry.action} for comic ${comic.name || comic.id}`)
    DebugLogger.info(`Comic ID: ${comic.id}, userId: ${comic.userId}`)

    switch (entry.action) {
      case 'created':
      case 'updated': {
        if (!comic.id) throw new Error('Comic ID is required')
        if (!comic.userId) throw new Error('Comic userId is required')

        const existing = await this.db.getComicById(comic.id)
        if (existing) {
          DebugLogger.info(`Updating existing comic: ${comic.id}`)
          // Remove chapters from comic data before updating - they're synced separately
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { chapters, ...comicWithoutChapters } = comic
          await this.db.updateComic(comic.id, comicWithoutChapters)
        } else {
          DebugLogger.info(`Creating new comic: ${comic.id} with userId: ${comic.userId}`)
          // Use the comic's userId directly - it matches the local user after auth
          await this.db.createComic(comic, [], comic.repo, comic.userId)

          // Verify the comic was created
          const created = await this.db.getComicById(comic.id)
          if (created) {
            DebugLogger.info(`✓ Successfully created comic: ${comic.id}`)
          } else {
            throw new Error(`Failed to create comic ${comic.id} - verification failed`)
          }
        }
        break
      }
      case 'deleted':
        DebugLogger.info(`Deleting comic: ${entry.entityId}`)
        await this.db.deleteComic(entry.entityId)
        break
    }
  }

  /**
   * Apply chapter changes
   */
  private async applyChapterChange(entry: IChangelogEntry): Promise<void> {
    const chapter = entry.data as IChapter

    DebugLogger.info(`Applying chapter change: ${entry.action} for chapter ${chapter.id}`)
    DebugLogger.info(`Chapter comicId: ${chapter.comicId}, type: ${typeof chapter.comicId}`)

    switch (entry.action) {
      case 'created':
      case 'updated': {
        if (!chapter.id) throw new Error('Chapter ID is required')
        if (!chapter.comicId) throw new Error('Chapter comicId is required')

        // Verify the parent comic exists
        const comic = await this.db.getComicById(chapter.comicId)

        if (!comic) {
          DebugLogger.error(`Comic ${chapter.comicId} not found for chapter ${chapter.id}`)
          throw new Error(
            `Cannot create chapter ${chapter.id}: parent comic ${chapter.comicId} does not exist`
          )
        }

        DebugLogger.info(`✓ Found parent comic: ${comic.id} "${comic.name}"`)

        const existing = await this.db.getChapterById(chapter.id)
        if (existing) {
          DebugLogger.info(`Updating existing chapter: ${chapter.id}`)
          await this.db.updateChapter(chapter.id, chapter)
        } else {
          DebugLogger.info(`Creating new chapter: ${chapter.id} for comic: ${chapter.comicId}`)
          await this.db.createChapter(chapter)
          DebugLogger.info(`✓ Successfully created chapter: ${chapter.id}`)
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

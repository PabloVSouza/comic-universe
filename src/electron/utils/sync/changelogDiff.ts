/**
 * Changelog Diff Utility
 *
 * This utility compares local and remote changelog entries to determine
 * what changes need to be applied to synchronize databases.
 *
 * Strategy:
 * - Latest timestamp wins for conflicts
 * - Group changes by entity type and action
 * - Handle cascading deletes (e.g., deleting comic should delete chapters)
 */

export interface ProcessedChangelog {
  comics: Map<string, { entry: IChangelogEntry; timestamp: string }>
  chapters: Map<string, { entry: IChangelogEntry; timestamp: string }>
  readProgress: Map<string, { entry: IChangelogEntry; timestamp: string }>
}

/**
 * Process changelog entries into organized maps
 */
export function processChangelogEntries(entries: IChangelogEntry[]): ProcessedChangelog {
  const processed: ProcessedChangelog = {
    comics: new Map(),
    chapters: new Map(),
    readProgress: new Map()
  }

  // Sort entries by timestamp to ensure latest changes are processed last
  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeA - timeB
  })

  for (const entry of sortedEntries) {
    if (entry.entityType === 'sync') continue // Skip sync metadata entries

    const timestamp = entry.createdAt || new Date().toISOString()
    const entityId = entry.entityId

    switch (entry.entityType) {
      case 'comic':
        processed.comics.set(entityId, { entry, timestamp })
        break
      case 'chapter':
        processed.chapters.set(entityId, { entry, timestamp })
        break
      case 'readProgress':
        processed.readProgress.set(entityId, { entry, timestamp })
        break
    }
  }

  return processed
}

/**
 * Generate diff between local and remote changelogs
 *
 * @param localEntries - Changelog entries from local database
 * @param remoteEntries - Changelog entries from remote/server
 * @returns ChangelogDiff with changes needed to sync
 */
export function generateChangelogDiff(
  localEntries: IChangelogEntry[],
  remoteEntries: IChangelogEntry[]
): {
  localDiff: ChangelogDiff
  remoteDiff: ChangelogDiff
  conflicts: SyncConflict[]
} {
  const local = processChangelogEntries(localEntries)
  const remote = processChangelogEntries(remoteEntries)
  const conflicts: SyncConflict[] = []

  // Changes to apply locally (from remote)
  const localDiff: ChangelogDiff = {
    toCreate: { comics: [], chapters: [], readProgress: [] },
    toUpdate: { comics: [], chapters: [], readProgress: [] },
    toDelete: { comicIds: [], chapterIds: [], readProgressIds: [] }
  }

  // Changes to push remotely (from local)
  const remoteDiff: ChangelogDiff = {
    toCreate: { comics: [], chapters: [], readProgress: [] },
    toUpdate: { comics: [], chapters: [], readProgress: [] },
    toDelete: { comicIds: [], chapterIds: [], readProgressIds: [] }
  }

  // Process comics
  processEntityDiff('comic', local.comics, remote.comics, localDiff, remoteDiff, conflicts)

  // Process chapters
  processEntityDiff('chapter', local.chapters, remote.chapters, localDiff, remoteDiff, conflicts)

  // Process read progress
  processEntityDiff(
    'readProgress',
    local.readProgress,
    remote.readProgress,
    localDiff,
    remoteDiff,
    conflicts
  )

  return { localDiff, remoteDiff, conflicts }
}

/**
 * Process diff for a specific entity type
 */
function processEntityDiff(
  entityType: 'comic' | 'chapter' | 'readProgress',
  localMap: Map<string, { entry: IChangelogEntry; timestamp: string }>,
  remoteMap: Map<string, { entry: IChangelogEntry; timestamp: string }>,
  localDiff: ChangelogDiff,
  remoteDiff: ChangelogDiff,
  conflicts: SyncConflict[]
): void {
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])

  for (const entityId of allIds) {
    const localData = localMap.get(entityId)
    const remoteData = remoteMap.get(entityId)

    // Only in local - push to remote
    if (localData && !remoteData) {
      applyChange(entityType, localData.entry, remoteDiff)
      continue
    }

    // Only in remote - apply locally
    if (remoteData && !localData) {
      applyChange(entityType, remoteData.entry, localDiff)
      continue
    }

    // In both - check for conflicts
    if (localData && remoteData) {
      const localTime = new Date(localData.timestamp).getTime()
      const remoteTime = new Date(remoteData.timestamp).getTime()

      // Same timestamp or action - no conflict
      if (localTime === remoteTime || localData.entry.action === remoteData.entry.action) {
        continue
      }

      // Conflict - latest wins
      const conflict: SyncConflict = {
        entityType,
        entityId,
        localUpdatedAt: localData.timestamp,
        remoteUpdatedAt: remoteData.timestamp,
        resolution: localTime > remoteTime ? 'local' : 'remote'
      }
      conflicts.push(conflict)

      if (conflict.resolution === 'local') {
        // Local is newer, push to remote
        applyChange(entityType, localData.entry, remoteDiff)
      } else {
        // Remote is newer, apply locally
        applyChange(entityType, remoteData.entry, localDiff)
      }
    }
  }
}

/**
 * Apply a changelog entry to a diff object
 */
function applyChange(
  entityType: 'comic' | 'chapter' | 'readProgress',
  entry: IChangelogEntry,
  diff: ChangelogDiff
): void {
  if (!entry.data) return

  const pluralType = `${entityType}${entityType === 'readProgress' ? '' : 's'}` as
    | 'comics'
    | 'chapters'
    | 'readProgress'

  switch (entry.action) {
    case 'created':
      ;(diff.toCreate[pluralType] as Array<IComic | IChapter | IReadProgress>).push(entry.data)
      break
    case 'updated':
      ;(diff.toUpdate[pluralType] as Array<IComic | IChapter | IReadProgress>).push(entry.data)
      break
    case 'deleted': {
      const idKey = `${entityType}Ids` as 'comicIds' | 'chapterIds' | 'readProgressIds'
      diff.toDelete[idKey].push(entry.entityId)
      break
    }
  }
}

/**
 * Merge local and remote changelogs, keeping only the latest version of each entity
 *
 * @param localEntries - Local changelog entries
 * @param remoteEntries - Remote changelog entries
 * @returns Merged changelog with latest entries
 */
export function mergeChangelogs(
  localEntries: IChangelogEntry[],
  remoteEntries: IChangelogEntry[]
): IChangelogEntry[] {
  const merged = new Map<string, IChangelogEntry>()

  const allEntries = [...localEntries, ...remoteEntries]

  // Sort by timestamp
  allEntries.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeA - timeB
  })

  // Keep latest version of each entity
  for (const entry of allEntries) {
    const key = `${entry.entityType}:${entry.entityId}`
    merged.set(key, entry)
  }

  return Array.from(merged.values())
}

/**
 * Validate that entity data is complete before syncing
 */
export function validateEntityData(
  entityType: 'comic' | 'chapter' | 'readProgress',
  data: IComic | IChapter | IReadProgress
): boolean {
  if (!data || !data.id) return false

  switch (entityType) {
    case 'comic': {
      const comic = data as IComic
      return !!(comic.siteId && comic.name && comic.repo && comic.synopsis && comic.type)
    }
    case 'chapter': {
      const chapter = data as IChapter
      return !!(chapter.comicId && chapter.siteId && chapter.repo && chapter.number)
    }
    case 'readProgress': {
      const progress = data as IReadProgress
      return !!(
        progress.chapterId &&
        progress.comicId &&
        progress.userId &&
        typeof progress.page === 'number' &&
        typeof progress.totalPages === 'number'
      )
    }
    default:
      return false
  }
}

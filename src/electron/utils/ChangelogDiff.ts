export interface ProcessedChangelog {
  comics: Map<string, { entry: IChangelogEntry; timestamp: string }>
  chapters: Map<string, { entry: IChangelogEntry; timestamp: string }>
  readProgress: Map<string, { entry: IChangelogEntry; timestamp: string }>
}

export function processChangelogEntries(entries: IChangelogEntry[]): ProcessedChangelog {
  const processed: ProcessedChangelog = {
    comics: new Map(),
    chapters: new Map(),
    readProgress: new Map()
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeA - timeB
  })

  for (const entry of sortedEntries) {
    if (entry.entityType === 'sync') continue

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

  const localDiff: ChangelogDiff = {
    toCreate: { comics: [], chapters: [], readProgress: [] },
    toUpdate: { comics: [], chapters: [], readProgress: [] },
    toDelete: { comicIds: [], chapterIds: [], readProgressIds: [] }
  }

  const remoteDiff: ChangelogDiff = {
    toCreate: { comics: [], chapters: [], readProgress: [] },
    toUpdate: { comics: [], chapters: [], readProgress: [] },
    toDelete: { comicIds: [], chapterIds: [], readProgressIds: [] }
  }

  processEntityDiff('comic', local.comics, remote.comics, localDiff, remoteDiff, conflicts)

  processEntityDiff('chapter', local.chapters, remote.chapters, localDiff, remoteDiff, conflicts)

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

    if (localData && !remoteData) {
      applyChange(entityType, localData.entry, remoteDiff)
      continue
    }

    if (remoteData && !localData) {
      applyChange(entityType, remoteData.entry, localDiff)
      continue
    }

    if (localData && remoteData) {
      const localTime = new Date(localData.timestamp).getTime()
      const remoteTime = new Date(remoteData.timestamp).getTime()

      if (localTime === remoteTime || localData.entry.action === remoteData.entry.action) {
        continue
      }

      const conflict: SyncConflict = {
        entityType,
        entityId,
        localUpdatedAt: localData.timestamp,
        remoteUpdatedAt: remoteData.timestamp,
        resolution: localTime > remoteTime ? 'local' : 'remote'
      }
      conflicts.push(conflict)

      if (conflict.resolution === 'local') {
        applyChange(entityType, localData.entry, remoteDiff)
      } else {
        applyChange(entityType, remoteData.entry, localDiff)
      }
    }
  }
}

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

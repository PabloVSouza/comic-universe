type IDBMethods = {
  //Comics
  dbGetComic: (input: { id: string }) => Promise<IComic>
  dbGetComicAdditionalData: (input: { id: string; userId: string }) => Promise<IComic>
  dbGetAllComics: (input: { userId: string }) => Promise<IComic[]>
  dbInsertComic: (input: {
    comic: IComic
    chapters: IChapter[]
    repo: string
    userId: string
  }) => Promise<void>
  dbUpdateComic: (input: { id: string; comic: Partial<IComic> }) => Promise<IComic | undefined>
  dbDeleteComic: (input: { comic: IComic }) => Promise<void>

  //Chapters
  dbGetAllChaptersNoPage: () => Promise<IChapter[]>
  dbGetChapters: (input: { comicId: string }) => Promise<IChapter[]>
  dbGetChapterById: (input: { id: string }) => Promise<IChapter | undefined>
  dbInsertChapters: (input: { chapters: IChapter[] }) => Promise<void>
  dbUpdateChapter: (input: { chapter: IChapter }) => Promise<IChapter>

  //Read Progress
  dbGetReadProgress: (input: { search: string }) => Promise<IReadProgress[]>
  dbGetReadProgressByUser: (input: { userId: string }) => Promise<IReadProgress[]>
  dbUpdateReadProgress: (input: { readProgress: IReadProgress }) => Promise<void>
  dbInsertReadProgress: (input: { readProgress: IReadProgress }) => Promise<void>

  //Users
  dbGetAllUsers: () => Promise<IUser[]>
  dbUpdateUser: (input: { user: IUser }) => Promise<IUser>
  dbDeleteUser: (input: { id: string }) => Promise<void>

  // User Settings
  dbGetUserSettings: (input: { userId: string }) => Promise<IUserSettings | undefined>
  dbUpdateUserSettings: (input: {
    userId: string
    settings: Partial<IUserSettings>
  }) => Promise<IUserSettings | undefined>

  // Website Authentication
  dbSetWebsiteAuthToken: (input: {
    userId: string
    token: string
    expiresAt: string
    deviceName: string
  }) => Promise<void>
  dbGetWebsiteAuthToken: (input: { userId: string }) => Promise<{
    token: string | null
    expiresAt: string | null
    deviceName: string | null
    isExpired: boolean
  } | null>
  dbClearWebsiteAuthToken: (input: { userId: string }) => Promise<void>

  dbRunMigrations: () => Promise<void>
  dbVerifyMigrations: () => Promise<boolean>

  // Changelog methods
  dbCreateChangelogEntry: (input: { entry: IChangelogEntry }) => Promise<IChangelogEntry>
  dbGetUnsyncedChangelogEntries: (input: { userId: string }) => Promise<IChangelogEntry[]>
  dbMarkChangelogEntriesAsSynced: (input: { entryIds: string[] }) => Promise<void>
  dbGetChangelogEntriesSince: (input: {
    userId: string
    timestamp: string
  }) => Promise<IChangelogEntry[]>

  // Sync methods
  dbSyncData: (input: {
    direction: SyncDirection
    userId?: string
    token?: string
  }) => Promise<SyncResult>
  dbGetSyncStatus: () => Promise<SyncState>
}

interface IDBRepository {
  methods: IDBMethods
}

interface IDBInteractionsRepositoryInit {
  path: string
}

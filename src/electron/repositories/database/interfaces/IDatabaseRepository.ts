export interface IDatabaseRepository {
  initialize(dbPath: string): Promise<void>
  close(): void
  isInitialized(): boolean

  runDrizzleMigrations(): Promise<void>
  verifyMigrations(): Promise<boolean>

  getAllComics(userId: string): Promise<IComic[]>
  getComicById(id: string): Promise<IComic | undefined>
  getComicBySiteId(siteId: string, userId: string): Promise<IComic | undefined>
  createComic(comic: IComic, chapters: IChapter[], repo: string, userId: string): Promise<void>
  updateComic(id: string, comic: Partial<IComic>): Promise<IComic | undefined>
  deleteComic(id: string): Promise<void>
  getComicWithChapters(
    comicId: string
  ): Promise<{ comic: IComic; chapters: IChapter[] } | undefined>
  getComicWithProgress(
    comicId: string,
    userId: string
  ): Promise<
    | {
        comic: IComic
        chapters: IChapter[]
        progress: IReadProgress[]
      }
    | undefined
  >

  getAllChaptersNoPage(): Promise<IChapter[]>
  getChaptersByComicId(comicId: string): Promise<IChapter[]>
  getChapterById(id: string): Promise<IChapter | undefined>
  getChapterBySiteId(siteId: string): Promise<IChapter | undefined>
  createChapter(chapter: IChapter): Promise<IChapter>
  createChapters(chapters: IChapter[]): Promise<void>
  updateChapter(id: string, chapter: Partial<IChapter>): Promise<IChapter | undefined>
  deleteChapter(id: string): Promise<void>

  getAllUsers(): Promise<IUser[]>
  getUserById(id: string): Promise<IUser | undefined>
  getDefaultUser(): Promise<IUser | undefined>
  createUser(user: IUser): Promise<IUser>
  updateUser(id: string, user: Partial<IUser>): Promise<IUser | undefined>
  deleteUser(id: string): Promise<void>

  getUserSettings(userId: string): Promise<IUserSettings | undefined>
  updateUserSettings(
    userId: string,
    settings: Partial<IUserSettings>
  ): Promise<IUserSettings | undefined>

  setWebsiteAuthToken(
    userId: string,
    token: string,
    expiresAt: string,
    deviceName: string
  ): Promise<{ userId: string; userIdChanged: boolean }>
  getWebsiteAuthToken(userId: string): Promise<{
    token: string | null
    expiresAt: string | null
    deviceName: string | null
    isExpired: boolean
  } | null>
  clearWebsiteAuthToken(userId: string): Promise<void>

  getReadProgressByUser(userId: string): Promise<IReadProgress[]>
  getReadProgressByComic(comicId: string, userId: string): Promise<IReadProgress[]>
  getReadProgressByChapter(chapterId: string, userId: string): Promise<IReadProgress | undefined>
  getReadProgress(search: Record<string, unknown>): Promise<IReadProgress[]>
  createReadProgress(progress: IReadProgress): Promise<IReadProgress>
  updateReadProgress(
    id: string,
    progress: Partial<IReadProgress>
  ): Promise<IReadProgress | undefined>
  deleteReadProgress(id: string): Promise<void>

  createChangelogEntry(entry: IChangelogEntry): Promise<IChangelogEntry>
  getUnsyncedChangelogEntries(userId: string): Promise<IChangelogEntry[]>
  markChangelogEntriesAsSynced(entryIds: string[]): Promise<void>
  getChangelogEntriesSince(userId: string, timestamp: string): Promise<IChangelogEntry[]>

  getAllPlugins(): Promise<IPlugin[]>
  getPluginById(id: number): Promise<IPlugin | undefined>
  getEnabledPlugins(): Promise<IPlugin[]>
  createPlugin(plugin: IPlugin): Promise<IPlugin>
  updatePlugin(id: number, plugin: Partial<IPlugin>): Promise<IPlugin | undefined>
  deletePlugin(id: number): Promise<void>
}

export interface IDatabaseConfig {
  dbPath: string
  enableForeignKeys?: boolean
  enableWAL?: boolean
  connectionTimeout?: number
}

export interface IMigration {
  version: number
  name: string
  up(): Promise<void>
  down?(): Promise<void>
}

export interface IDatabaseFactory {
  createRepository(config: IDatabaseConfig): IDatabaseRepository
  getSupportedORMs(): string[]
}

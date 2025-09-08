// ORM-agnostic interface for database operations
// Uses global type definitions from @types directory
export interface IDatabaseRepository {
  // Initialization
  initialize(dbPath: string): Promise<void>
  close(): void
  isInitialized(): boolean

  // Migration management
  runMigrations(): Promise<void>
  verifyMigrations(): Promise<boolean>

  // Comic operations
  getAllComics(): Promise<IComic[]>
  getComicById(id: number): Promise<IComic | undefined>
  getComicBySiteId(siteId: string): Promise<IComic | undefined>
  createComic(comic: IComic, chapters: IChapter[], repo: string): Promise<void>
  updateComic(id: number, comic: Partial<IComic>): Promise<IComic | undefined>
  deleteComic(id: number): Promise<void>
  getComicWithChapters(
    comicId: number
  ): Promise<{ comic: IComic; chapters: IChapter[] } | undefined>
  getComicWithProgress(
    comicId: number,
    userId: number
  ): Promise<
    | {
        comic: IComic
        chapters: IChapter[]
        progress: IReadProgress[]
      }
    | undefined
  >

  // Chapter operations
  getAllChaptersNoPage(): Promise<IChapter[]>
  getChaptersByComicId(comicId: number): Promise<IChapter[]>
  getChapterById(id: number): Promise<IChapter | undefined>
  getChapterBySiteId(siteId: string): Promise<IChapter | undefined>
  createChapter(chapter: IChapter): Promise<IChapter>
  createChapters(chapters: IChapter[]): Promise<void>
  updateChapter(id: number, chapter: Partial<IChapter>): Promise<IChapter | undefined>
  deleteChapter(id: number): Promise<void>

  // User operations
  getAllUsers(): Promise<IUser[]>
  getUserById(id: number): Promise<IUser | undefined>
  getDefaultUser(): Promise<IUser | undefined>
  createUser(user: IUser): Promise<IUser>
  updateUser(id: number, user: Partial<IUser>): Promise<IUser | undefined>
  deleteUser(id: number): Promise<void>

  // ReadProgress operations
  getReadProgressByUser(userId: number): Promise<IReadProgress[]>
  getReadProgressByComic(comicId: number, userId: number): Promise<IReadProgress[]>
  getReadProgressByChapter(chapterId: number, userId: number): Promise<IReadProgress | undefined>
  getReadProgress(search: Record<string, unknown>): Promise<IReadProgress[]>
  createReadProgress(progress: IReadProgress): Promise<IReadProgress>
  updateReadProgress(
    id: number,
    progress: Partial<IReadProgress>
  ): Promise<IReadProgress | undefined>
  deleteReadProgress(id: number): Promise<void>

  // Plugin operations
  getAllPlugins(): Promise<IPlugin[]>
  getPluginById(id: number): Promise<IPlugin | undefined>
  getEnabledPlugins(): Promise<IPlugin[]>
  createPlugin(plugin: IPlugin): Promise<IPlugin>
  updatePlugin(id: number, plugin: Partial<IPlugin>): Promise<IPlugin | undefined>
  deletePlugin(id: number): Promise<void>
}

// Database configuration interface
export interface IDatabaseConfig {
  dbPath: string
  enableForeignKeys?: boolean
  enableWAL?: boolean
  connectionTimeout?: number
}

// Migration interface
export interface IMigration {
  version: number
  name: string
  up(): Promise<void>
  down?(): Promise<void>
}

// Database factory interface
export interface IDatabaseFactory {
  createRepository(config: IDatabaseConfig): IDatabaseRepository
  getSupportedORMs(): string[]
}

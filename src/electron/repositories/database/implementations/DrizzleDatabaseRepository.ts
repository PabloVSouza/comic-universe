import { eq, and, isNull, asc } from 'drizzle-orm'
import { IDatabaseRepository } from '../interfaces/IDatabaseRepository'
import { comics, chapters, users, readProgress, plugins, type NewChapter } from 'database/schema'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import DebugLogger from 'electron-utils/DebugLogger'

export class DrizzleDatabaseRepository implements IDatabaseRepository {
  private db: BetterSQLite3Database<Record<string, unknown>> | null = null
  private sqlite: Database.Database | null = null

  async initialize(dbPath: string): Promise<void> {
    if (this.db) {
      // Database already initialized
      return
    }

    try {
      // Initializing Drizzle database

      // Create database connection
      this.sqlite = new Database(dbPath)

      // Enable foreign keys
      this.sqlite.pragma('foreign_keys = ON')

      // Create Drizzle instance
      this.db = drizzle(this.sqlite, {
        schema: { comics, chapters, users, readProgress, plugins }
      })

      // Run migrations
      await this.runDrizzleMigrations()

      // Drizzle database initialized successfully
    } catch (error) {
      console.error('Failed to initialize Drizzle database:', error)
      throw error
    }
  }

  close(): void {
    if (this.sqlite) {
      this.sqlite.close()
      this.sqlite = null
      this.db = null
      // Database connection closed
    }
  }

  isInitialized(): boolean {
    return this.db !== null
  }

  private getDb() {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  async runDrizzleMigrations(): Promise<void> {
    // Starting Drizzle automatic migrations

    const db = this.getDb()

    try {
      // Use path that works for both dev and production builds
      // In dev: migrations are in src/database/migrations
      // In production: migrations are unpacked to app.asar.unpacked/out/database/migrations
      const isProduction = __dirname.includes('app.asar')
      let migrationsPath: string

      if (isProduction) {
        // Production build - migrations are unpacked to Contents/Resources/app.asar.unpacked/out/database/migrations
        const { app } = await import('electron')
        const appPath = app.getAppPath()
        // app.getAppPath() returns path to app.asar, so we need to go to the unpacked directory
        // The correct path is: app.asar -> .. -> app.asar.unpacked -> out -> database -> migrations
        migrationsPath = path.join(
          appPath,
          '..',
          'app.asar.unpacked',
          'out',
          'database',
          'migrations'
        )
      } else {
        // Development - migrations are in src/database/migrations
        migrationsPath = path.join(process.cwd(), 'src', 'database', 'migrations')
      }

      // Running migrations from path: migrationsPath
      await migrate(db, { migrationsFolder: migrationsPath })

      // Drizzle migrations completed successfully
    } catch (error) {
      console.error('Drizzle migrations failed:', error)
      throw error
    }
  }

  async verifyMigrations(): Promise<boolean> {
    try {
      const db = this.getDb()
      await db.select().from(comics).limit(1)
      return true
    } catch {
      return false
    }
  }

  // Comic operations
  async getAllComics(): Promise<IComic[]> {
    const db = this.getDb()
    const results = await db.select().from(comics).orderBy(asc(comics.name))
    return results.map((result) => ({
      ...result,
      settings: result.settings || {}
    })) as IComic[]
  }

  async getComicById(id: number): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.select().from(comics).where(eq(comics.id, id)).limit(1)
    return result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined
  }

  async getComicBySiteId(siteId: string): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.select().from(comics).where(eq(comics.siteId, siteId)).limit(1)
    return result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined
  }

  async createComic(comic: IComic, chapterList: IChapter[], repo: string): Promise<void> {
    const db = this.getDb()

    await DebugLogger.log('createComic called with:', { comic, chapterList, repo })
    await DebugLogger.log(
      'chapterList type:',
      typeof chapterList,
      'is array:',
      Array.isArray(chapterList)
    )
    await DebugLogger.log('chapterList length:', chapterList?.length)

    // Create the comic - exclude id and chapters from the insert
    const { id: _id, chapters: _chapters, ...comicData } = comic

    // Filter out undefined values and ensure required fields are present
    const cleanComicData = {
      siteId: comicData.siteId,
      name: comicData.name,
      cover: comicData.cover,
      repo,
      author: comicData.author || null,
      artist: comicData.artist || null,
      publisher: comicData.publisher || null,
      status: comicData.status || null,
      genres: comicData.genres || null,
      siteLink: comicData.siteLink || null,
      year: comicData.year || null,
      synopsis: comicData.synopsis,
      type: comicData.type
    }

    await DebugLogger.log('Inserting comic with data:', cleanComicData)

    const newComic = await db.insert(comics).values(cleanComicData).returning()

    // Create the chapters
    if (chapterList && chapterList.length > 0) {
      for (const chapter of chapterList) {
        const {
          id: _chapterId,
          comicId: _comicId,
          Comic: _Comic,
          ReadProgress: _ReadProgress,
          ...chapterData
        } = chapter

        // Filter out undefined values for chapters
        const cleanChapterData = {
          siteId: chapterData.siteId,
          siteLink: chapterData.siteLink || null,
          releaseId: chapterData.releaseId || null,
          repo,
          name: chapterData.name || null,
          number: chapterData.number,
          pages: chapterData.pages || null,
          date: chapterData.date || null,
          offline: chapterData.offline || false,
          language: chapterData.language || null,
          comicId: newComic[0].id
        }

        await DebugLogger.log('Inserting chapter with data:', cleanChapterData)

        try {
          await db.insert(chapters).values(cleanChapterData)
        } catch (error) {
          await DebugLogger.error('Error inserting chapter:', error)
          await DebugLogger.error('Chapter data:', cleanChapterData)
          throw error
        }
      }
    }
  }

  async updateComic(id: number, comic: Partial<IComic>): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.update(comics).set(comic).where(eq(comics.id, id)).returning()
    return result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined
  }

  async deleteComic(id: number): Promise<void> {
    const db = this.getDb()

    // Delete read progress first
    await db.delete(readProgress).where(eq(readProgress.comicId, id))

    // Delete chapters
    await db.delete(chapters).where(eq(chapters.comicId, id))

    // Delete comic
    await db.delete(comics).where(eq(comics.id, id))
  }

  async getComicWithChapters(
    comicId: number
  ): Promise<{ comic: IComic; chapters: IChapter[] } | undefined> {
    const comic = await this.getComicById(comicId)
    if (!comic) return undefined

    const chapters = await this.getChaptersByComicId(comicId)
    return { comic, chapters }
  }

  async getComicWithProgress(
    comicId: number,
    userId: number
  ): Promise<
    | {
        comic: IComic
        chapters: IChapter[]
        progress: IReadProgress[]
      }
    | undefined
  > {
    const comicData = await this.getComicWithChapters(comicId)
    if (!comicData) return undefined

    const progress = await this.getReadProgressByComic(comicId, userId)
    return {
      ...comicData,
      progress
    }
  }

  // Chapter operations
  async getAllChaptersNoPage(): Promise<IChapter[]> {
    const db = this.getDb()
    return await db.select().from(chapters).where(isNull(chapters.pages))
  }

  async getChaptersByComicId(comicId: number): Promise<IChapter[]> {
    const db = this.getDb()
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.comicId, comicId))
      .orderBy(asc(chapters.number))
  }

  async getChapterById(id: number): Promise<IChapter | undefined> {
    const db = this.getDb()
    const result = await db.select().from(chapters).where(eq(chapters.id, id)).limit(1)
    return result[0]
  }

  async getChapterBySiteId(siteId: string): Promise<IChapter | undefined> {
    const db = this.getDb()
    const result = await db.select().from(chapters).where(eq(chapters.siteId, siteId)).limit(1)
    return result[0]
  }

  async createChapter(chapter: IChapter): Promise<IChapter> {
    const db = this.getDb()
    const { id: _id, Comic: _Comic, ReadProgress: _ReadProgress, ...chapterData } = chapter

    // Ensure comicId is defined
    if (!chapterData.comicId) {
      throw new Error('comicId is required for chapter creation')
    }

    const result = await db
      .insert(chapters)
      .values(chapterData as NewChapter)
      .returning()
    return result[0] as IChapter
  }

  async createChapters(chapterList: IChapter[]): Promise<void> {
    const db = this.getDb()
    for (const chapter of chapterList) {
      const { id: _id, Comic: _Comic, ReadProgress: _ReadProgress, ...chapterData } = chapter

      // Ensure comicId is defined
      if (!chapterData.comicId) {
        throw new Error('comicId is required for chapter creation')
      }

      await db.insert(chapters).values(chapterData as NewChapter)
    }
  }

  async updateChapter(id: number, chapter: Partial<IChapter>): Promise<IChapter | undefined> {
    const db = this.getDb()
    const result = await db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning()
    return result[0]
  }

  async deleteChapter(id: number): Promise<void> {
    const db = this.getDb()
    await db.delete(chapters).where(eq(chapters.id, id))
  }

  // User operations
  async getAllUsers(): Promise<IUser[]> {
    const db = this.getDb()
    return await db.select().from(users).orderBy(asc(users.name))
  }

  async getUserById(id: number): Promise<IUser | undefined> {
    const db = this.getDb()
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0]
  }

  async getDefaultUser(): Promise<IUser | undefined> {
    const db = this.getDb()
    const result = await db.select().from(users).where(eq(users.default, true)).limit(1)
    return result[0]
  }

  async createUser(user: IUser): Promise<IUser> {
    const db = this.getDb()
    const result = await db.insert(users).values(user).returning()
    return result[0]
  }

  async updateUser(id: number, user: Partial<IUser>): Promise<IUser | undefined> {
    const db = this.getDb()
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning()
    return result[0]
  }

  async deleteUser(id: number): Promise<void> {
    const db = this.getDb()

    // Delete read progress first
    await db.delete(readProgress).where(eq(readProgress.userId, id))

    // Delete user
    await db.delete(users).where(eq(users.id, id))
  }

  // User settings operations
  async getUserSettings(userId: number): Promise<IUserSettings | undefined> {
    const db = this.getDb()
    const result = await db
      .select({ settings: users.settings })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    const settings = result[0]?.settings
    return settings ? (settings as IUserSettings) : undefined
  }

  async updateUserSettings(
    userId: number,
    settings: Partial<IUserSettings>
  ): Promise<IUserSettings | undefined> {
    const db = this.getDb()

    // Get current settings
    const currentUser = await this.getUserById(userId)
    if (!currentUser) {
      return undefined
    }

    // Merge with existing settings
    const currentSettings = currentUser.settings || {}
    const mergedSettings = { ...currentSettings, ...settings }

    // Update user with new settings
    const result = await db
      .update(users)
      .set({ settings: mergedSettings })
      .where(eq(users.id, userId))
      .returning()
    const updatedSettings = result[0]?.settings
    return updatedSettings ? (updatedSettings as IUserSettings) : undefined
  }

  // ReadProgress operations
  async getReadProgressByUser(userId: number): Promise<IReadProgress[]> {
    const db = this.getDb()
    const results = await db.select().from(readProgress).where(eq(readProgress.userId, userId))
    return results
  }

  async getReadProgressByComic(comicId: number, userId: number): Promise<IReadProgress[]> {
    const db = this.getDb()
    const results = await db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.comicId, comicId), eq(readProgress.userId, userId)))
    return results
  }

  async getReadProgressByChapter(
    chapterId: number,
    userId: number
  ): Promise<IReadProgress | undefined> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.chapterId, chapterId), eq(readProgress.userId, userId)))
      .limit(1)
    return result[0]
  }

  async getReadProgress(search: Record<string, unknown>): Promise<IReadProgress[]> {
    const db = this.getDb()

    // Handle different search patterns
    let progress: IReadProgress[] = []

    if (search.userId && search.comicId) {
      progress = await this.getReadProgressByComic(
        search.comicId as number,
        search.userId as number
      )
    } else if (search.chapterId && search.userId) {
      const singleProgress = await this.getReadProgressByChapter(
        search.chapterId as number,
        search.userId as number
      )
      progress = singleProgress ? [singleProgress] : []
    } else if (search.userId) {
      progress = await this.getReadProgressByUser(search.userId as number)
    } else {
      // Fallback to raw query for complex searches
      const results = await db.select().from(readProgress)
      progress = results
    }

    return progress
  }

  async createReadProgress(progress: IReadProgress): Promise<IReadProgress> {
    const db = this.getDb()
    const result = await db.insert(readProgress).values(progress).returning()
    return result[0]
  }

  async updateReadProgress(
    id: number,
    progress: Partial<IReadProgress>
  ): Promise<IReadProgress | undefined> {
    const db = this.getDb()
    const result = await db
      .update(readProgress)
      .set(progress)
      .where(eq(readProgress.id, id))
      .returning()
    return result[0]
  }

  async deleteReadProgress(id: number): Promise<void> {
    const db = this.getDb()
    await db.delete(readProgress).where(eq(readProgress.id, id))
  }

  // Plugin operations
  async getAllPlugins(): Promise<IPlugin[]> {
    const db = this.getDb()
    return await db.select().from(plugins).orderBy(asc(plugins.name))
  }

  async getPluginById(id: number): Promise<IPlugin | undefined> {
    const db = this.getDb()
    const result = await db.select().from(plugins).where(eq(plugins.id, id)).limit(1)
    return result[0]
  }

  async getEnabledPlugins(): Promise<IPlugin[]> {
    const db = this.getDb()
    return await db
      .select()
      .from(plugins)
      .where(eq(plugins.enabled, true))
      .orderBy(asc(plugins.name))
  }

  async createPlugin(plugin: IPlugin): Promise<IPlugin> {
    const db = this.getDb()
    const result = await db.insert(plugins).values(plugin).returning()
    return result[0]
  }

  async updatePlugin(id: number, plugin: Partial<IPlugin>): Promise<IPlugin | undefined> {
    const db = this.getDb()
    const result = await db.update(plugins).set(plugin).where(eq(plugins.id, id)).returning()
    return result[0]
  }

  async deletePlugin(id: number): Promise<void> {
    const db = this.getDb()
    await db.delete(plugins).where(eq(plugins.id, id))
  }
}

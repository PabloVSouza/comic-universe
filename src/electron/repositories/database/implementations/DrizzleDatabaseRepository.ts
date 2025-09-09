import { eq, and, isNull, asc } from 'drizzle-orm'
import { IDatabaseRepository, IMigration } from '../interfaces/IDatabaseRepository'
import { comics, chapters, users, readProgress, plugins } from 'database/schema'
import { sql } from 'drizzle-orm'
import Database, { type BetterSQLite3Database } from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import DebugLogger from '../../../utils/DebugLogger'

export class DrizzleDatabaseRepository implements IDatabaseRepository {
  private db: BetterSQLite3Database<Record<string, unknown>> | null = null
  private sqlite: Database.Database | null = null

  async initialize(dbPath: string): Promise<void> {
    if (this.db) {
      console.log('Database already initialized')
      return
    }

    try {
      console.log(`Initializing Drizzle database at: ${dbPath}`)

      // Create database connection
      this.sqlite = new Database(dbPath)

      // Enable foreign keys
      this.sqlite.pragma('foreign_keys = ON')

      // Create Drizzle instance
      this.db = drizzle(this.sqlite, {
        schema: { comics, chapters, users, readProgress, plugins }
      })

      // Run migrations
      await this.runMigrations()

      console.log('✅ Drizzle database initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Drizzle database:', error)
      throw error
    }
  }

  close(): void {
    if (this.sqlite) {
      this.sqlite.close()
      this.sqlite = null
      this.db = null
      console.log('Drizzle database connection closed')
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

  async runMigrations(): Promise<void> {
    console.log('Starting Drizzle database migrations...')

    const db = this.getDb()

    // Create migrations table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get current version
    const currentVersionResult = await db.get(sql`
      SELECT MAX(version) as version FROM schema_migrations
    `)

    const currentVersion = currentVersionResult?.version || 0
    console.log(`Current database version: ${currentVersion}`)

    // Define migrations
    const migrations: IMigration[] = [
      {
        version: 1,
        name: 'initial_schema',
        async up() {
          const statements = [
            sql`CREATE TABLE IF NOT EXISTS "Plugin" (
              "id" INTEGER PRIMARY KEY AUTOINCREMENT,
              "enabled" BOOLEAN DEFAULT true NOT NULL,
              "name" TEXT NOT NULL,
              "repository" TEXT NOT NULL,
              "version" TEXT NOT NULL,
              "path" TEXT NOT NULL
            )`,
            sql`CREATE TABLE IF NOT EXISTS "User" (
              "id" INTEGER PRIMARY KEY AUTOINCREMENT,
              "name" TEXT NOT NULL,
              "default" BOOLEAN DEFAULT false NOT NULL
            )`,
            sql`CREATE TABLE IF NOT EXISTS "Comic" (
              "id" INTEGER PRIMARY KEY AUTOINCREMENT,
              "siteId" TEXT NOT NULL,
              "name" TEXT NOT NULL,
              "cover" TEXT NOT NULL,
              "repo" TEXT NOT NULL,
              "author" TEXT,
              "artist" TEXT,
              "publisher" TEXT,
              "status" TEXT,
              "genres" TEXT,
              "siteLink" TEXT,
              "year" TEXT,
              "synopsis" TEXT NOT NULL,
              "type" TEXT NOT NULL
            )`,
            sql`CREATE TABLE IF NOT EXISTS "Chapter" (
              "id" INTEGER PRIMARY KEY AUTOINCREMENT,
              "comicId" INTEGER NOT NULL,
              "siteId" TEXT NOT NULL,
              "siteLink" TEXT,
              "releaseId" TEXT,
              "repo" TEXT NOT NULL,
              "name" TEXT,
              "number" TEXT NOT NULL,
              "pages" TEXT,
              "date" TEXT,
              "offline" BOOLEAN DEFAULT false NOT NULL,
              "language" TEXT,
              FOREIGN KEY ("comicId") REFERENCES "Comic" ("id")
            )`,
            sql`CREATE TABLE IF NOT EXISTS "ReadProgress" (
              "id" INTEGER PRIMARY KEY AUTOINCREMENT,
              "chapterId" INTEGER NOT NULL,
              "comicId" INTEGER NOT NULL,
              "userId" INTEGER NOT NULL,
              "totalPages" INTEGER NOT NULL,
              "page" INTEGER NOT NULL,
              FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id"),
              FOREIGN KEY ("comicId") REFERENCES "Comic" ("id"),
              FOREIGN KEY ("userId") REFERENCES "User" ("id")
            )`
          ]

          for (const statement of statements) {
            await db.run(statement)
          }
        }
      }
    ]

    // Run pending migrations
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.name}...`)

        try {
          await migration.up()
          await db.run(sql`
            INSERT INTO schema_migrations (version, name) VALUES (${migration.version}, ${migration.name})
          `)
          console.log(`✅ Migration ${migration.version} completed successfully`)
        } catch (error) {
          console.error(`❌ Migration ${migration.version} failed:`, error)
          throw error
        }
      }
    }

    console.log('Drizzle database migrations completed successfully')
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
    return await db.select().from(comics).orderBy(asc(comics.name))
  }

  async getComicById(id: number): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.select().from(comics).where(eq(comics.id, id)).limit(1)
    return result[0]
  }

  async getComicBySiteId(siteId: string): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.select().from(comics).where(eq(comics.siteId, siteId)).limit(1)
    return result[0]
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
    const result = await db.insert(chapters).values(chapterData).returning()
    return result[0]
  }

  async createChapters(chapters: IChapter[]): Promise<void> {
    const db = this.getDb()
    for (const chapter of chapters) {
      const { id: _id, Comic: _Comic, ReadProgress: _ReadProgress, ...chapterData } = chapter
      await db.insert(chapters).values(chapterData)
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

  // ReadProgress operations
  async getReadProgressByUser(userId: number): Promise<IReadProgress[]> {
    const db = this.getDb()
    return await db.select().from(readProgress).where(eq(readProgress.userId, userId))
  }

  async getReadProgressByComic(comicId: number, userId: number): Promise<IReadProgress[]> {
    const db = this.getDb()
    return await db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.comicId, comicId), eq(readProgress.userId, userId)))
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
      progress = await db.select().from(readProgress)
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

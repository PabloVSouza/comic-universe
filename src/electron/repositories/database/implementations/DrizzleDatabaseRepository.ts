import { eq, and, isNull, asc } from 'drizzle-orm'
import { IDatabaseRepository } from '../interfaces/IDatabaseRepository'
import {
  comics,
  chapters,
  users,
  readProgress,
  plugins,
  changelog,
  type NewChapter
} from 'database/schema'
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
      return
    }

    try {
      this.sqlite = new Database(dbPath)
      this.sqlite.pragma('foreign_keys = ON')
      this.db = drizzle(this.sqlite, {
        schema: { comics, chapters, users, readProgress, plugins }
      })
      await this.runDrizzleMigrations()
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
    const db = this.getDb()

    try {
      const isProduction = __dirname.includes('app.asar')
      let migrationsPath: string

      if (isProduction) {
        const { app } = await import('electron')
        const appPath = app.getAppPath()
        migrationsPath = path.join(
          appPath,
          '..',
          'app.asar.unpacked',
          'out',
          'database',
          'migrations'
        )
      } else {
        migrationsPath = path.join(process.cwd(), 'src', 'database', 'migrations')
      }

      await migrate(db, { migrationsFolder: migrationsPath })
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

  async getAllComics(userId: string): Promise<IComic[]> {
    const db = this.getDb()
    const results = await db
      .select()
      .from(comics)
      .where(eq(comics.userId, userId))
      .orderBy(asc(comics.name))
    return results.map((result) => ({
      ...result,
      settings: result.settings || {}
    })) as IComic[]
  }

  async getComicById(id: string): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.select().from(comics).where(eq(comics.id, id)).limit(1)
    return result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined
  }

  async getComicBySiteId(siteId: string, userId: string): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(comics)
      .where(and(eq(comics.siteId, siteId), eq(comics.userId, userId)))
      .limit(1)
    return result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined
  }

  async createComic(
    comic: IComic,
    chapterList: IChapter[],
    repo: string,
    userId: string
  ): Promise<void> {
    const db = this.getDb()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { chapters: comicChapters, ...comicData } = comic
    const cleanComicData = {
      ...(comic.id && { id: comic.id }), // Only include ID if it exists (from cloud)
      userId,
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

    const newComic = await db.insert(comics).values(cleanComicData).returning()

    if (chapterList && chapterList.length > 0 && newComic[0]?.id) {
      for (const chapter of chapterList) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { comicId, Comic, ReadProgress, ...chapterData } = chapter
        const cleanChapterData = {
          ...(chapter.id && { id: chapter.id }), // Only include ID if it exists (from cloud)
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
          comicId: newComic[0].id // Use the comic ID from the database
        }

        try {
          await db.insert(chapters).values(cleanChapterData as NewChapter)

          // Log chapter creation in changelog
          await this.createChangelogEntry({
            userId,
            entityType: 'chapter',
            entityId: cleanChapterData.id || '',
            action: 'created',
            data: cleanChapterData
          })
        } catch (error) {
          await DebugLogger.error('Error inserting chapter:', error)
          await DebugLogger.error('Chapter data:', cleanChapterData)
          throw error
        }
      }
    }

    // Log comic creation in changelog
    await this.createChangelogEntry({
      userId,
      entityType: 'comic',
      entityId: newComic[0].id,
      action: 'created',
      data: newComic[0]
    })
  }

  async updateComic(id: string, comic: Partial<IComic>): Promise<IComic | undefined> {
    const db = this.getDb()
    const result = await db.update(comics).set(comic).where(eq(comics.id, id)).returning()

    const updatedComic = result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined

    if (updatedComic) {
      // Log comic update in changelog
      await this.createChangelogEntry({
        userId: updatedComic.userId || '',
        entityType: 'comic',
        entityId: id,
        action: 'updated',
        data: updatedComic
      })
    }

    return updatedComic
  }

  async deleteComic(id: string): Promise<void> {
    const db = this.getDb()

    // Get comic data before deletion for changelog
    const comicToDelete = await this.getComicById(id)

    // Get chapters before deletion for changelog
    const chaptersToDelete = await this.getChaptersByComicId(id)

    await db.delete(readProgress).where(eq(readProgress.comicId, id))
    await db.delete(chapters).where(eq(chapters.comicId, id))
    await db.delete(comics).where(eq(comics.id, id))

    // Log comic deletion in changelog
    if (comicToDelete) {
      await this.createChangelogEntry({
        userId: comicToDelete.userId || '',
        entityType: 'comic',
        entityId: id,
        action: 'deleted',
        data: comicToDelete
      })
    }

    // Log chapter deletions in changelog
    for (const chapter of chaptersToDelete) {
      await this.createChangelogEntry({
        userId: comicToDelete?.userId || '',
        entityType: 'chapter',
        entityId: chapter.id || '',
        action: 'deleted',
        data: chapter
      })
    }
  }

  async getComicWithChapters(
    comicId: string
  ): Promise<{ comic: IComic; chapters: IChapter[] } | undefined> {
    const comic = await this.getComicById(comicId)
    if (!comic) return undefined

    const chapters = await this.getChaptersByComicId(comicId)
    return { comic, chapters }
  }

  async getComicWithProgress(
    comicId: string,
    userId: string
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

  async getAllChaptersNoPage(): Promise<IChapter[]> {
    const db = this.getDb()
    return await db.select().from(chapters).where(isNull(chapters.pages))
  }

  async getChaptersByComicId(comicId: string): Promise<IChapter[]> {
    const db = this.getDb()
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.comicId, comicId))
      .orderBy(asc(chapters.number))
  }

  async getChapterById(id: string): Promise<IChapter | undefined> {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, Comic, ReadProgress, ...chapterData } = chapter
    if (!chapterData.comicId) {
      throw new Error('comicId is required for chapter creation')
    }

    const result = await db
      .insert(chapters)
      .values(chapterData as NewChapter)
      .returning()

    const newChapter = result[0] as IChapter

    // Get userId from comic for changelog
    const comic = await this.getComicById(chapterData.comicId)

    // Log chapter creation in changelog
    await this.createChangelogEntry({
      userId: comic?.userId || '',
      entityType: 'chapter',
      entityId: newChapter.id || '',
      action: 'created',
      data: newChapter
    })

    return newChapter
  }

  async createChapters(chapterList: IChapter[]): Promise<void> {
    const db = this.getDb()
    for (const chapter of chapterList) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, Comic, ReadProgress, ...chapterData } = chapter
      if (!chapterData.comicId) {
        throw new Error('comicId is required for chapter creation')
      }

      const result = await db
        .insert(chapters)
        .values(chapterData as NewChapter)
        .returning()
      const newChapter = result[0]

      // Get userId from comic for changelog
      const comic = await this.getComicById(chapterData.comicId)

      // Log chapter creation in changelog
      await this.createChangelogEntry({
        userId: comic?.userId || '',
        entityType: 'chapter',
        entityId: newChapter.id,
        action: 'created',
        data: newChapter
      })
    }
  }

  async updateChapter(id: string, chapter: Partial<IChapter>): Promise<IChapter | undefined> {
    const db = this.getDb()
    const result = await db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning()

    const updatedChapter = result[0]

    if (updatedChapter) {
      // Get userId from comic for changelog
      const comic = await this.getComicById(updatedChapter.comicId)

      // Log chapter update in changelog
      await this.createChangelogEntry({
        userId: comic?.userId || '',
        entityType: 'chapter',
        entityId: id,
        action: 'updated',
        data: updatedChapter
      })
    }

    return updatedChapter
  }

  async deleteChapter(id: string): Promise<void> {
    const db = this.getDb()

    // Get chapter data before deletion for changelog
    const chapterToDelete = await this.getChapterById(id)

    await db.delete(chapters).where(eq(chapters.id, id))

    if (chapterToDelete && chapterToDelete.comicId) {
      // Get userId from comic for changelog
      const comic = await this.getComicById(chapterToDelete.comicId)

      // Log chapter deletion in changelog
      await this.createChangelogEntry({
        userId: comic?.userId || '',
        entityType: 'chapter',
        entityId: id,
        action: 'deleted',
        data: chapterToDelete
      })
    }
  }

  async getAllUsers(): Promise<IUser[]> {
    const db = this.getDb()
    return await db.select().from(users).orderBy(asc(users.name))
  }

  async getUserById(id: string): Promise<IUser | undefined> {
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

  async updateUser(id: string, user: Partial<IUser>): Promise<IUser | undefined> {
    const db = this.getDb()
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning()
    return result[0]
  }

  async deleteUser(id: string): Promise<void> {
    const db = this.getDb()

    await db.delete(readProgress).where(eq(readProgress.userId, id))
    await db.delete(users).where(eq(users.id, id))
  }

  async getUserSettings(userId: string): Promise<IUserSettings | undefined> {
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
    userId: string,
    settings: Partial<IUserSettings>
  ): Promise<IUserSettings | undefined> {
    const db = this.getDb()

    const currentUser = await this.getUserById(userId)
    if (!currentUser) {
      return undefined
    }

    const currentSettings = currentUser.settings || {}
    const mergedSettings = { ...currentSettings, ...settings }
    const result = await db
      .update(users)
      .set({ settings: mergedSettings })
      .where(eq(users.id, userId))
      .returning()
    const updatedSettings = result[0]?.settings
    return updatedSettings ? (updatedSettings as IUserSettings) : undefined
  }

  async setWebsiteAuthToken(
    userId: string,
    token: string,
    expiresAt: string,
    deviceName: string
  ): Promise<void> {
    const db = this.getDb()
    await db
      .update(users)
      .set({
        websiteAuthToken: token,
        websiteAuthExpiresAt: expiresAt,
        websiteAuthDeviceName: deviceName
      })
      .where(eq(users.id, userId))
  }

  async getWebsiteAuthToken(userId: string): Promise<{
    token: string | null
    expiresAt: string | null
    deviceName: string | null
    isExpired: boolean
  } | null> {
    const db = this.getDb()
    const result = await db
      .select({
        websiteAuthToken: users.websiteAuthToken,
        websiteAuthExpiresAt: users.websiteAuthExpiresAt,
        websiteAuthDeviceName: users.websiteAuthDeviceName
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!result[0]) {
      return null
    }

    const { websiteAuthToken, websiteAuthExpiresAt, websiteAuthDeviceName } = result[0]

    if (!websiteAuthToken || !websiteAuthExpiresAt) {
      return {
        token: null,
        expiresAt: null,
        deviceName: null,
        isExpired: true
      }
    }

    const isExpired = new Date() > new Date(websiteAuthExpiresAt)

    return {
      token: websiteAuthToken,
      expiresAt: websiteAuthExpiresAt,
      deviceName: websiteAuthDeviceName,
      isExpired
    }
  }

  async clearWebsiteAuthToken(userId: string): Promise<void> {
    const db = this.getDb()
    await db
      .update(users)
      .set({
        websiteAuthToken: null,
        websiteAuthExpiresAt: null,
        websiteAuthDeviceName: null
      })
      .where(eq(users.id, userId))
  }

  async getReadProgressByUser(userId: string): Promise<IReadProgress[]> {
    const db = this.getDb()
    const results = await db.select().from(readProgress).where(eq(readProgress.userId, userId))
    return results.map((progress) => ({
      ...progress,
      updatedAt: progress.updatedAt || undefined
    }))
  }

  async getReadProgressByComic(comicId: string, userId: string): Promise<IReadProgress[]> {
    const db = this.getDb()
    const results = await db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.comicId, comicId), eq(readProgress.userId, userId)))
    return results.map((progress) => ({
      ...progress,
      updatedAt: progress.updatedAt || undefined
    }))
  }

  async getReadProgressByChapter(
    chapterId: string,
    userId: string
  ): Promise<IReadProgress | undefined> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.chapterId, chapterId), eq(readProgress.userId, userId)))
      .limit(1)
    return result[0]
      ? {
          ...result[0],
          updatedAt: result[0].updatedAt || undefined
        }
      : undefined
  }

  async getReadProgress(search: Record<string, unknown>): Promise<IReadProgress[]> {
    const db = this.getDb()

    let progress: IReadProgress[] = []

    if (search.userId && search.comicId) {
      progress = await this.getReadProgressByComic(
        search.comicId as string,
        search.userId as string
      )
    } else if (search.chapterId && search.userId) {
      const singleProgress = await this.getReadProgressByChapter(
        search.chapterId as string,
        search.userId as string
      )
      progress = singleProgress ? [singleProgress] : []
    } else if (search.userId) {
      progress = await this.getReadProgressByUser(search.userId as string)
    } else {
      const results = await db.select().from(readProgress)
      progress = results.map((progress) => ({
        ...progress,
        updatedAt: progress.updatedAt || undefined
      }))
    }

    return progress
  }

  async createReadProgress(progress: IReadProgress): Promise<IReadProgress> {
    const db = this.getDb()
    const result = await db
      .insert(readProgress)
      .values({
        ...progress,
        updatedAt: new Date().toISOString()
      })
      .returning()

    const newProgress = {
      ...result[0],
      updatedAt: result[0].updatedAt || undefined
    }

    // Log read progress creation in changelog
    await this.createChangelogEntry({
      userId: progress.userId,
      entityType: 'readProgress',
      entityId: newProgress.id,
      action: 'created',
      data: newProgress
    })

    return newProgress
  }

  async updateReadProgress(
    id: string,
    progress: Partial<IReadProgress>
  ): Promise<IReadProgress | undefined> {
    const db = this.getDb()
    const result = await db
      .update(readProgress)
      .set({
        ...progress,
        updatedAt: new Date().toISOString()
      })
      .where(eq(readProgress.id, id))
      .returning()

    const updatedProgress = result[0]
      ? {
          ...result[0],
          updatedAt: result[0].updatedAt || undefined
        }
      : undefined

    if (updatedProgress) {
      // Log read progress update in changelog
      await this.createChangelogEntry({
        userId: updatedProgress.userId,
        entityType: 'readProgress',
        entityId: id,
        action: 'updated',
        data: updatedProgress
      })
    }

    return updatedProgress
  }

  async deleteReadProgress(id: string): Promise<void> {
    const db = this.getDb()

    // Get read progress data before deletion for changelog
    const progressToDelete = await db
      .select()
      .from(readProgress)
      .where(eq(readProgress.id, id))
      .limit(1)

    await db.delete(readProgress).where(eq(readProgress.id, id))

    if (progressToDelete[0]) {
      // Log read progress deletion in changelog
      await this.createChangelogEntry({
        userId: progressToDelete[0].userId,
        entityType: 'readProgress',
        entityId: id,
        action: 'deleted',
        data: progressToDelete[0]
      })
    }
  }

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

  // Changelog operations
  async createChangelogEntry(entry: IChangelogEntry): Promise<IChangelogEntry> {
    const db = this.getDb()
    const result = await db
      .insert(changelog)
      .values({
        ...entry,
        data: entry.data ? JSON.stringify(entry.data) : null
      })
      .returning()

    return {
      ...result[0],
      entityType: result[0].entityType as IChangelogEntry['entityType'],
      action: result[0].action as IChangelogEntry['action'],
      data: result[0].data ? JSON.parse(result[0].data) : undefined,
      createdAt: result[0].createdAt || undefined,
      synced: result[0].synced || false
    }
  }

  async getUnsyncedChangelogEntries(userId: string): Promise<IChangelogEntry[]> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(changelog)
      .where(and(eq(changelog.userId, userId), eq(changelog.synced, false)))
      .orderBy(asc(changelog.createdAt))

    return result.map((entry) => ({
      ...entry,
      entityType: entry.entityType as IChangelogEntry['entityType'],
      action: entry.action as IChangelogEntry['action'],
      data: entry.data ? JSON.parse(entry.data) : undefined,
      createdAt: entry.createdAt || undefined,
      synced: entry.synced || false
    }))
  }

  async markChangelogEntriesAsSynced(entryIds: string[]): Promise<void> {
    const db = this.getDb()
    await db
      .update(changelog)
      .set({ synced: true })
      .where(
        and(
          eq(changelog.id, entryIds[0]), // This is a simplified version - would need to handle multiple IDs properly
          eq(changelog.synced, false)
        )
      )
  }

  async getChangelogEntriesSince(userId: string, _timestamp: string): Promise<IChangelogEntry[]> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(changelog)
      .where(
        and(
          eq(changelog.userId, userId)
          // Note: This would need proper timestamp comparison
          // For now, returning all entries
        )
      )
      .orderBy(asc(changelog.createdAt))

    return result.map((entry) => ({
      ...entry,
      entityType: entry.entityType as IChangelogEntry['entityType'],
      action: entry.action as IChangelogEntry['action'],
      data: entry.data ? JSON.parse(entry.data) : undefined,
      createdAt: entry.createdAt || undefined,
      synced: entry.synced || false
    }))
  }
}

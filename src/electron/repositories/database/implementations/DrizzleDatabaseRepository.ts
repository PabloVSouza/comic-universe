import path from 'path'
import Database from 'better-sqlite3'
import {
  comics,
  chapters,
  users,
  readProgress,
  plugins,
  changelog,
  type NewChapter
} from 'database/schema'
import { eq, and, isNull, asc, inArray } from 'drizzle-orm'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import DebugLogger from 'electron-utils/DebugLogger'
import { API_URLS } from 'shared/constants'
import { IDatabaseRepository } from '../interfaces/IDatabaseRepository'

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
    const { chapters: _comicChapters, ...comicData } = comic
    const cleanComicData = {
      ...(comic.id && { id: comic.id }),
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
        const cleanChapterData = {
          ...(chapter.id && { id: chapter.id }),
          siteId: chapter.siteId,
          siteLink: chapter.siteLink || null,
          releaseId: chapter.releaseId || null,
          repo,
          name: chapter.name || null,
          number: chapter.number,
          pages: chapter.pages || null,
          date: chapter.date || null,
          offline: chapter.offline || false,
          language: chapter.language || null,
          comicId: newComic[0].id
        }

        try {
          const insertedChapter = await db
            .insert(chapters)
            .values(cleanChapterData as NewChapter)
            .returning()

          if (insertedChapter[0]?.id) {
            await this.createChangelogEntry({
              userId,
              entityType: 'chapter',
              entityId: insertedChapter[0].id,
              action: 'created',
              data: insertedChapter[0]
            })
          }
        } catch (error) {
          await DebugLogger.error('Error inserting chapter:', error)
          await DebugLogger.error('Chapter data:', cleanChapterData)
          throw error
        }
      }
    }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const { chapters, addedAt, updatedAt, ...comicData } = comic as any

    const result = await db.update(comics).set(comicData).where(eq(comics.id, id)).returning()

    const updatedComic = result[0]
      ? ({
          ...result[0],
          settings: result[0].settings || {}
        } as IComic)
      : undefined

    if (updatedComic) {
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

    const comicToDelete = await this.getComicById(id)

    const chaptersToDelete = await this.getChaptersByComicId(id)

    await db.delete(readProgress).where(eq(readProgress.comicId, id))
    await db.delete(chapters).where(eq(chapters.comicId, id))
    await db.delete(comics).where(eq(comics.id, id))

    if (comicToDelete) {
      await this.createChangelogEntry({
        userId: comicToDelete.userId || '',
        entityType: 'comic',
        entityId: id,
        action: 'deleted',
        data: comicToDelete
      })
    }

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

    if (!chapter.comicId) {
      throw new Error('comicId is required for chapter creation')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanChapterData: any = {
      comicId: chapter.comicId,
      siteId: chapter.siteId,
      repo: chapter.repo,
      number: chapter.number,
      offline: chapter.offline || false
    }

    if (chapter.id) {
      cleanChapterData.id = chapter.id
    }

    if (chapter.siteLink) cleanChapterData.siteLink = chapter.siteLink
    if (chapter.releaseId) cleanChapterData.releaseId = chapter.releaseId
    if (chapter.name) cleanChapterData.name = chapter.name
    if (chapter.pages) cleanChapterData.pages = chapter.pages
    if (chapter.date) cleanChapterData.date = chapter.date
    if (chapter.language) cleanChapterData.language = chapter.language

    const result = await db.insert(chapters).values(cleanChapterData).returning()

    const newChapter = result[0] as IChapter

    const comic = await this.getComicById(chapter.comicId)

    if (comic?.userId && newChapter.id) {
      await this.createChangelogEntry({
        userId: comic.userId,
        entityType: 'chapter',
        entityId: newChapter.id,
        action: 'created',
        data: newChapter
      })
    }

    return newChapter
  }

  async createChapters(chapterList: IChapter[]): Promise<void> {
    const db = this.getDb()
    for (const chapter of chapterList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { Comic, ReadProgress, createdAt, ...chapterData } = chapter as any
      if (!chapterData.comicId) {
        throw new Error('comicId is required for chapter creation')
      }

      const cleanChapterData = {
        ...(chapterData.id && { id: chapterData.id }),
        comicId: chapterData.comicId,
        siteId: chapterData.siteId,
        siteLink: chapterData.siteLink || null,
        releaseId: chapterData.releaseId || null,
        repo: chapterData.repo,
        name: chapterData.name || null,
        number: chapterData.number,
        pages: chapterData.pages || null,
        date: chapterData.date || null,
        offline: chapterData.offline || false,
        language: chapterData.language || null
      }

      const result = await db
        .insert(chapters)
        .values(cleanChapterData as NewChapter)
        .returning()
      const newChapter = result[0]

      const comic = await this.getComicById(chapterData.comicId)

      if (comic?.userId && newChapter.id) {
        await this.createChangelogEntry({
          userId: comic.userId,
          entityType: 'chapter',
          entityId: newChapter.id,
          action: 'created',
          data: newChapter
        })
      }
    }
  }

  async updateChapter(id: string, chapter: Partial<IChapter>): Promise<IChapter | undefined> {
    const db = this.getDb()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanChapterData: any = {}

    if (chapter.comicId !== undefined) cleanChapterData.comicId = chapter.comicId
    if (chapter.siteId !== undefined) cleanChapterData.siteId = chapter.siteId
    if (chapter.siteLink !== undefined) cleanChapterData.siteLink = chapter.siteLink
    if (chapter.releaseId !== undefined) cleanChapterData.releaseId = chapter.releaseId
    if (chapter.repo !== undefined) cleanChapterData.repo = chapter.repo
    if (chapter.name !== undefined) cleanChapterData.name = chapter.name
    if (chapter.number !== undefined) cleanChapterData.number = chapter.number
    if (chapter.pages !== undefined) cleanChapterData.pages = chapter.pages
    if (chapter.date !== undefined) cleanChapterData.date = chapter.date
    if (chapter.offline !== undefined) cleanChapterData.offline = chapter.offline
    if (chapter.language !== undefined) cleanChapterData.language = chapter.language

    const result = await db
      .update(chapters)
      .set(cleanChapterData)
      .where(eq(chapters.id, id))
      .returning()

    const updatedChapter = result[0]

    if (updatedChapter) {
      const comic = await this.getComicById(updatedChapter.comicId)

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

    const chapterToDelete = await this.getChapterById(id)

    await db.delete(chapters).where(eq(chapters.id, id))

    if (chapterToDelete && chapterToDelete.comicId) {
      const comic = await this.getComicById(chapterToDelete.comicId)

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

    await db.delete(changelog).where(eq(changelog.userId, id))

    const userComics = await db.select({ id: comics.id }).from(comics).where(eq(comics.userId, id))

    for (const comic of userComics) {
      await db.delete(chapters).where(eq(chapters.comicId, comic.id))
    }

    await db.delete(comics).where(eq(comics.userId, id))

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
  ): Promise<{ userId: string; userIdChanged: boolean }> {
    const db = this.getDb()

    const websiteUserId = await this.getWebsiteUserIdFromToken(token)

    let userIdChanged = false
    if (websiteUserId && websiteUserId !== userId) {
      await this.updateUserIdRecursively(userId, websiteUserId)
      userIdChanged = true
    }

    const finalUserId = websiteUserId || userId
    await db
      .update(users)
      .set({
        websiteAuthToken: token,
        websiteAuthExpiresAt: expiresAt,
        websiteAuthDeviceName: deviceName,
        websiteUserId: websiteUserId
      })
      .where(eq(users.id, finalUserId))

    return { userId: finalUserId, userIdChanged }
  }

  private async getWebsiteUserIdFromToken(token: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${process.env.WEBSITE_URL || API_URLS.DEV}/api/auth/verify-app-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      return data.user?.id || null
    } catch (error) {
      console.error('Failed to get website user ID:', error)
      return null
    }
  }

  private async updateUserIdRecursively(oldUserId: string, newUserId: string): Promise<void> {
    const db = this.getDb()

    await db.update(comics).set({ userId: newUserId }).where(eq(comics.userId, oldUserId))

    await db
      .update(readProgress)
      .set({ userId: newUserId })
      .where(eq(readProgress.userId, oldUserId))

    await db.update(changelog).set({ userId: newUserId }).where(eq(changelog.userId, oldUserId))

    const oldUser = await db.select().from(users).where(eq(users.id, oldUserId)).limit(1)

    if (oldUser.length > 0) {
      await db
        .insert(users)
        .values({
          ...oldUser[0],
          id: newUserId
        })
        .onConflictDoNothing()

      await db.delete(users).where(eq(users.id, oldUserId))
    }
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

    const progressToDelete = await db
      .select()
      .from(readProgress)
      .where(eq(readProgress.id, id))
      .limit(1)

    await db.delete(readProgress).where(eq(readProgress.id, id))

    if (progressToDelete[0]) {
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
    if (entryIds.length === 0) return

    await db
      .update(changelog)
      .set({ synced: true })
      .where(and(inArray(changelog.id, entryIds), eq(changelog.synced, false)))
  }

  async deleteChangelogEntries(entryIds: string[]): Promise<void> {
    const db = this.getDb()
    if (entryIds.length === 0) return

    await db.delete(changelog).where(inArray(changelog.id, entryIds))
  }

  async getChangelogEntriesSince(userId: string): Promise<IChangelogEntry[]> {
    const db = this.getDb()
    const result = await db
      .select()
      .from(changelog)
      .where(and(eq(changelog.userId, userId)))
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

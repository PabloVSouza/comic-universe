import { eq, and, asc } from 'drizzle-orm'
import { getDatabase } from './index'
import {
  comics,
  chapters,
  users,
  readProgress,
  plugins,
  type Comic,
  type Chapter,
  type User,
  type ReadProgress,
  type Plugin,
  type NewComic,
  type NewChapter,
  type NewUser,
  type NewReadProgress,
  type NewPlugin
} from './index'

export class DatabaseService {
  private get db() {
    return getDatabase()
  }

  // Comic operations
  async getAllComics(): Promise<Comic[]> {
    return await this.db.select().from(comics).orderBy(asc(comics.name))
  }

  async getComicById(id: number): Promise<Comic | undefined> {
    const result = await this.db.select().from(comics).where(eq(comics.id, id)).limit(1)
    return result[0]
  }

  async getComicBySiteId(siteId: string): Promise<Comic | undefined> {
    const result = await this.db.select().from(comics).where(eq(comics.siteId, siteId)).limit(1)
    return result[0]
  }

  async createComic(comic: NewComic): Promise<Comic> {
    const result = await this.db.insert(comics).values(comic).returning()
    return result[0]
  }

  async updateComic(id: number, comic: Partial<NewComic>): Promise<Comic | undefined> {
    const result = await this.db.update(comics).set(comic).where(eq(comics.id, id)).returning()
    return result[0]
  }

  async deleteComic(id: number): Promise<void> {
    await this.db.delete(comics).where(eq(comics.id, id))
  }

  // Chapter operations
  async getChaptersByComicId(comicId: number): Promise<Chapter[]> {
    return await this.db
      .select()
      .from(chapters)
      .where(eq(chapters.comicId, comicId))
      .orderBy(asc(chapters.number))
  }

  async getChapterById(id: number): Promise<Chapter | undefined> {
    const result = await this.db.select().from(chapters).where(eq(chapters.id, id)).limit(1)
    return result[0]
  }

  async getChapterBySiteId(siteId: string): Promise<Chapter | undefined> {
    const result = await this.db.select().from(chapters).where(eq(chapters.siteId, siteId)).limit(1)
    return result[0]
  }

  async createChapter(chapter: NewChapter): Promise<Chapter> {
    const result = await this.db.insert(chapters).values(chapter).returning()
    return result[0]
  }

  async updateChapter(id: number, chapter: Partial<NewChapter>): Promise<Chapter | undefined> {
    const result = await this.db
      .update(chapters)
      .set(chapter)
      .where(eq(chapters.id, id))
      .returning()
    return result[0]
  }

  async deleteChapter(id: number): Promise<void> {
    await this.db.delete(chapters).where(eq(chapters.id, id))
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users).orderBy(asc(users.name))
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0]
  }

  async getDefaultUser(): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.default, true)).limit(1)
    return result[0]
  }

  async createUser(user: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning()
    return result[0]
  }

  async updateUser(id: number, user: Partial<NewUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(user).where(eq(users.id, id)).returning()
    return result[0]
  }

  async deleteUser(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id))
  }

  // ReadProgress operations
  async getReadProgressByUser(userId: number): Promise<ReadProgress[]> {
    return await this.db.select().from(readProgress).where(eq(readProgress.userId, userId))
  }

  async getReadProgressByComic(comicId: number, userId: number): Promise<ReadProgress[]> {
    return await this.db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.comicId, comicId), eq(readProgress.userId, userId)))
  }

  async getReadProgressByChapter(
    chapterId: number,
    userId: number
  ): Promise<ReadProgress | undefined> {
    const result = await this.db
      .select()
      .from(readProgress)
      .where(and(eq(readProgress.chapterId, chapterId), eq(readProgress.userId, userId)))
      .limit(1)
    return result[0]
  }

  async createReadProgress(progress: NewReadProgress): Promise<ReadProgress> {
    const result = await this.db.insert(readProgress).values(progress).returning()
    return result[0]
  }

  async updateReadProgress(
    id: number,
    progress: Partial<NewReadProgress>
  ): Promise<ReadProgress | undefined> {
    const result = await this.db
      .update(readProgress)
      .set(progress)
      .where(eq(readProgress.id, id))
      .returning()
    return result[0]
  }

  async deleteReadProgress(id: number): Promise<void> {
    await this.db.delete(readProgress).where(eq(readProgress.id, id))
  }

  // Plugin operations
  async getAllPlugins(): Promise<Plugin[]> {
    return await this.db.select().from(plugins).orderBy(asc(plugins.name))
  }

  async getPluginById(id: number): Promise<Plugin | undefined> {
    const result = await this.db.select().from(plugins).where(eq(plugins.id, id)).limit(1)
    return result[0]
  }

  async getEnabledPlugins(): Promise<Plugin[]> {
    return await this.db
      .select()
      .from(plugins)
      .where(eq(plugins.enabled, true))
      .orderBy(asc(plugins.name))
  }

  async createPlugin(plugin: NewPlugin): Promise<Plugin> {
    const result = await this.db.insert(plugins).values(plugin).returning()
    return result[0]
  }

  async updatePlugin(id: number, plugin: Partial<NewPlugin>): Promise<Plugin | undefined> {
    const result = await this.db.update(plugins).set(plugin).where(eq(plugins.id, id)).returning()
    return result[0]
  }

  async deletePlugin(id: number): Promise<void> {
    await this.db.delete(plugins).where(eq(plugins.id, id))
  }

  // Complex queries
  async getComicWithChapters(
    comicId: number
  ): Promise<{ comic: Comic; chapters: Chapter[] } | undefined> {
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
        comic: Comic
        chapters: Chapter[]
        progress: ReadProgress[]
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
}

// Export a function to get the service instance
let _dbService: DatabaseService | null = null;

export function getDbService(): DatabaseService {
  if (!_dbService) {
    _dbService = new DatabaseService();
  }
  return _dbService;
}

// For backward compatibility, export a getter
export const dbService = {
  get instance() {
    return getDbService();
  }
};

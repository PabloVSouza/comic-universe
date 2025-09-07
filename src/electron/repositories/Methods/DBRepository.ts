import { initializeDatabase, dbService } from '../../../database'
import { DataPaths } from 'utils/utils'
import { eq, isNull } from 'drizzle-orm'
import { comics, chapters, readProgress } from '../../../database'

class DBRepository implements IDBRepository {
  private db: any

  constructor() {
    // Use the centralized data paths utility
    DataPaths.ensureDirectoryExists(DataPaths.getDatabasePath())
  }

  public startup = async () => {
    // Initialize Drizzle database
    this.db = await initializeDatabase()
  }

  methods: IDBMethods = {
    dbRunMigrations: async () => {
      // Migrations are handled automatically during database initialization
      console.log('Migrations handled during database initialization')
    },

    dbVerifyMigrations: async () => {
      // For Drizzle, we can check if tables exist
      try {
        await this.db.select().from(comics).limit(1)
        return true
      } catch (error) {
        return false
      }
    },

    //Comics
    dbGetComic: async ({ id }): Promise<IComic> => {
      const comic = await dbService.getComicById(id)
      return new Promise((resolve) => {
        resolve(comic as IComic)
      })
    },

    dbGetComicAdditionalData: async ({ id, userId }): Promise<IComic> => {
      const comicData = await dbService.getComicWithProgress(id, userId)
      if (!comicData) {
        throw new Error(`Comic with id ${id} not found`)
      }

      // Transform the data to match the expected interface
      const comic = {
        ...comicData.comic,
        chapters: comicData.chapters.map(chapter => ({
          ...chapter,
          ReadProgress: comicData.progress.filter(p => p.chapterId === chapter.id)
        }))
      }

      return new Promise((resolve) => {
        resolve(comic as IComic)
      })
    },

    dbGetAllComics: async (): Promise<IComic[]> => {
      const comics = await dbService.getAllComics()
      return new Promise((resolve) => {
        resolve(comics as IComic[])
      })
    },

    dbInsertComic: async ({ comic, chapters, repo }): Promise<void> => {
      // Create the comic
      const newComic = await dbService.createComic({
        ...comic,
        repo
      })

      // Create the chapters
      for (const chapter of chapters) {
        await dbService.createChapter({
          ...chapter,
          comicId: newComic.id,
          repo
        })
      }

      return new Promise((resolve) => {
        resolve()
      })
    },

    dbDeleteComic: async ({ comic }): Promise<void> => {
      const comicId = comic.id
      
      // Delete read progress first
      await this.db.delete(readProgress).where(eq(readProgress.comicId, comicId))
      
      // Delete chapters
      await this.db.delete(chapters).where(eq(chapters.comicId, comicId))
      
      // Delete comic
      await dbService.deleteComic(comicId)

      return new Promise((resolve) => resolve())
    },

    //Chapters
    dbGetAllChaptersNoPage: async (): Promise<IChapter[]> => {
      const chaptersList = await this.db.select().from(chapters).where(isNull(chapters.pages))
      return new Promise((resolve) => {
        resolve(chaptersList as IChapter[])
      })
    },

    dbGetChapters: async ({ comicId }): Promise<IChapter[]> => {
      const chapters = await dbService.getChaptersByComicId(comicId)
      return new Promise((resolve) => {
        resolve(chapters as IChapter[])
      })
    },

    dbInsertChapters: async ({ chapters }): Promise<void> => {
      for (const chapter of chapters) {
        await dbService.createChapter(chapter)
      }
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbUpdateChapter: async ({ chapter }): Promise<IChapter> => {
      const updatedChapter = await dbService.updateChapter(chapter.id, chapter)
      if (!updatedChapter) {
        throw new Error(`Chapter with id ${chapter.id} not found`)
      }

      return new Promise((resolve) => {
        resolve(updatedChapter as IChapter)
      })
    },

    //Read Progress
    dbGetReadProgress: async (search: any): Promise<IReadProgress[]> => {
      // Handle different search patterns
      let progress: any[] = []
      
      if (search.userId && search.comicId) {
        progress = await dbService.getReadProgressByComic(search.comicId, search.userId)
      } else if (search.userId) {
        progress = await dbService.getReadProgressByUser(search.userId)
      } else if (search.chapterId && search.userId) {
        const singleProgress = await dbService.getReadProgressByChapter(search.chapterId, search.userId)
        progress = singleProgress ? [singleProgress] : []
      } else {
        // Fallback to raw query for complex searches
        progress = await this.db.select().from(readProgress).where(search)
      }

      return new Promise((resolve) => {
        resolve(progress as IReadProgress[])
      })
    },

    dbUpdateReadProgress: async ({ readProgress }): Promise<void> => {
      if (!readProgress.id) {
        await dbService.createReadProgress(readProgress)
      } else {
        await dbService.updateReadProgress(readProgress.id, readProgress)
      }

      return new Promise((resolve) => resolve())
    },

    //Users
    dbGetAllUsers: async (): Promise<IUser[]> => {
      const users = await dbService.getAllUsers()
      return new Promise((resolve) => {
        resolve(users as IUser[])
      })
    },

    dbUpdateUser: async ({ user }): Promise<IUser> => {
      let userData: any

      if (user.id) {
        userData = await dbService.updateUser(user.id, user)
        if (!userData) {
          throw new Error(`User with id ${user.id} not found`)
        }
      } else {
        userData = await dbService.createUser(user)
      }

      return new Promise((resolve) => {
        resolve(userData as IUser)
      })
    },

    dbDeleteUser: async ({ id }): Promise<void> => {
      // Delete read progress first
      await this.db.delete(readProgress).where(eq(readProgress.userId, id))
      
      // Delete user
      await dbService.deleteUser(id)
      
      return new Promise((resolve) => {
        resolve()
      })
    }
  }
}

export default DBRepository
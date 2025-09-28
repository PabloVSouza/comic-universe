import { initializeDatabase, IDatabaseRepository } from '../database'
import { DataPaths } from 'electron-utils/utils'

class DBRepository implements IDBRepository {
  private repository!: IDatabaseRepository

  constructor() {
    // Use the centralized data paths utility
    DataPaths.ensureDirectoryExists(DataPaths.getDatabasePath())
  }

  public startup = async () => {
    // Initialize ORM-agnostic database with custom path
    const dbPath = DataPaths.getDatabaseFilePath()
    this.repository = await initializeDatabase(dbPath)
  }

  methods: IDBMethods = {
    dbRunMigrations: async () => {
      await this.repository.runDrizzleMigrations()
    },

    dbVerifyMigrations: async () => {
      return await this.repository.verifyMigrations()
    },

    //Comics
    dbGetComic: async ({ id }): Promise<IComic> => {
      const comic = await this.repository.getComicById(id)
      return new Promise((resolve) => {
        resolve(comic as IComic)
      })
    },

    dbGetComicAdditionalData: async ({ id, userId }): Promise<IComic> => {
      const comicData = await this.repository.getComicWithProgress(id, userId)
      if (!comicData) {
        throw new Error(`Comic with id ${id} not found`)
      }

      // Transform the data to match the expected interface
      const comic = {
        ...comicData.comic,
        chapters: comicData.chapters.map((chapter) => ({
          ...chapter,
          ReadProgress: comicData.progress.filter((p) => p.chapterId === chapter.id)
        }))
      }

      return new Promise((resolve) => {
        resolve(comic as IComic)
      })
    },

    dbGetAllComics: async ({ userId }): Promise<IComic[]> => {
      const comics = await this.repository.getAllComics(userId)
      return new Promise((resolve) => {
        resolve(comics as IComic[])
      })
    },

    dbInsertComic: async ({ comic, chapters, repo, userId }): Promise<void> => {
      await this.repository.createComic(comic, chapters, repo, userId)
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbUpdateComic: async ({ id, comic }): Promise<IComic | undefined> => {
      const updatedComic = await this.repository.updateComic(id, comic)
      return new Promise((resolve) => {
        resolve(updatedComic)
      })
    },

    dbDeleteComic: async ({ comic }): Promise<void> => {
      if (!comic.id) {
        throw new Error('Cannot delete comic: comic ID is required')
      }
      await this.repository.deleteComic(comic.id)
      return new Promise((resolve) => resolve())
    },

    //Chapters
    dbGetAllChaptersNoPage: async (): Promise<IChapter[]> => {
      const chapters = await this.repository.getAllChaptersNoPage()
      return new Promise((resolve) => {
        resolve(chapters as IChapter[])
      })
    },

    dbGetChapters: async ({ comicId }): Promise<IChapter[]> => {
      const chapters = await this.repository.getChaptersByComicId(comicId)
      return new Promise((resolve) => {
        resolve(chapters as IChapter[])
      })
    },

    dbInsertChapters: async ({ chapters }): Promise<void> => {
      await this.repository.createChapters(chapters)
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbUpdateChapter: async ({ chapter }): Promise<IChapter> => {
      if (!chapter.id) {
        throw new Error('Cannot update chapter: chapter ID is required')
      }
      const updatedChapter = await this.repository.updateChapter(chapter.id, chapter)
      if (!updatedChapter) {
        throw new Error(`Chapter with id ${chapter.id} not found`)
      }

      return new Promise((resolve) => {
        resolve(updatedChapter as IChapter)
      })
    },

    //Read Progress
    dbGetReadProgress: async (search: Record<string, unknown>): Promise<IReadProgress[]> => {
      const progress = await this.repository.getReadProgress(search)
      return new Promise((resolve) => {
        resolve(progress as IReadProgress[])
      })
    },

    dbUpdateReadProgress: async ({ readProgress }): Promise<void> => {
      if (!readProgress.id) {
        await this.repository.createReadProgress(readProgress)
      } else {
        await this.repository.updateReadProgress(readProgress.id, readProgress)
      }

      return new Promise((resolve) => resolve())
    },

    dbGetReadProgressByUser: async ({ userId }): Promise<IReadProgress[]> => {
      const progress = await this.repository.getReadProgressByUser(userId)
      return new Promise((resolve) => {
        resolve(progress as IReadProgress[])
      })
    },

    //Users
    dbGetAllUsers: async (): Promise<IUser[]> => {
      const users = await this.repository.getAllUsers()
      return new Promise((resolve) => {
        resolve(users as IUser[])
      })
    },

    dbUpdateUser: async ({ user }): Promise<IUser> => {
      let userData: IUser | undefined

      if (user.id) {
        userData = await this.repository.updateUser(user.id, user)
        if (!userData) {
          throw new Error(`User with id ${user.id} not found`)
        }
      } else {
        userData = await this.repository.createUser(user)
      }

      return new Promise((resolve) => {
        resolve(userData as IUser)
      })
    },

    dbDeleteUser: async ({ id }): Promise<void> => {
      await this.repository.deleteUser(id)
      return new Promise((resolve) => {
        resolve()
      })
    },

    // User Settings
    dbGetUserSettings: async ({ userId }): Promise<IUserSettings | undefined> => {
      const settings = await this.repository.getUserSettings(userId)
      return new Promise((resolve) => {
        resolve(settings || undefined)
      })
    },

    dbUpdateUserSettings: async ({ userId, settings }): Promise<IUserSettings | undefined> => {
      const updatedSettings = await this.repository.updateUserSettings(userId, settings)
      return new Promise((resolve) => {
        resolve(updatedSettings || undefined)
      })
    },

    // Website Authentication
    dbSetWebsiteAuthToken: async ({ userId, token, expiresAt, deviceName }): Promise<void> => {
      await this.repository.setWebsiteAuthToken(userId, token, expiresAt, deviceName)
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbGetWebsiteAuthToken: async ({ userId }): Promise<{
      token: string | null
      expiresAt: string | null
      deviceName: string | null
      isExpired: boolean
    } | null> => {
      const authData = await this.repository.getWebsiteAuthToken(userId)
      return new Promise((resolve) => {
        resolve(authData)
      })
    },

    dbClearWebsiteAuthToken: async ({ userId }): Promise<void> => {
      await this.repository.clearWebsiteAuthToken(userId)
      return new Promise((resolve) => {
        resolve()
      })
    }
  }
}

export default DBRepository

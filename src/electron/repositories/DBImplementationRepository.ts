import { is } from '@electron-toolkit/utils'
import path from 'path'
import { PrismaInitializer } from 'prisma-shell-extension'
import { Chapter, Comic, PrismaClient, User } from '@prisma/client'

export class DBInteractionsRepository implements IDBInteractionsRepository {
  private db = {} as PrismaClient
  private prismaInitializer = {} as PrismaInitializer

  constructor(private dbPath: string) {
    const cnnParams = '?socket_timeout=10&connection_limit=1'
    const prodDb = `file:${path.join(this.dbPath, 'db', 'database.db')}${cnnParams}`
    const devDb = `file:../database.db${cnnParams}`

    this.dbPath = is.dev ? devDb : prodDb
  }

  public startup = async () => {
    this.prismaInitializer = new PrismaInitializer(this.dbPath, '20240805000921_plugin_table')
    await this.prismaInitializer.initializePrisma()
    this.db = this.prismaInitializer.prisma
    await this.prismaInitializer.runMigration()
  }

  methods: IDBInteractionsMethods = {
    dbRunMigrations: async () => {
      await this.prismaInitializer.runMigration()
    },

    dbVerifyMigrations: async () => {
      return await this.prismaInitializer.verifyMigration(this.db)
    },

    //Comics
    dbGetComic: async ({ id }): Promise<ComicInterface> => {
      const comic = await this.db.comic.findUnique({ where: { id } })
      return new Promise((resolve) => {
        resolve(comic as ComicInterface)
      })
    },

    dbGetComicComplete: async ({ id, userId }): Promise<ComicInterface> => {
      const comic = await this.db.comic.findUnique({
        where: { id },
        include: {
          chapters: {
            include: { ReadProgress: { where: { userId } } }
          }
        }
      })

      return new Promise((resolve) => {
        resolve(comic as ComicInterface)
      })
    },

    dbGetAllComics: async (): Promise<ComicInterface[]> => {
      const comics = (await this.db.comic.findMany({
        include: { chapters: true }
      })) as ComicInterface[]
      return new Promise((resolve) => {
        resolve(comics)
      })
    },

    dbInsertComic: async ({ comic, chapters, repo }): Promise<void> => {
      const newComic = await this.db.comic.create({
        data: { ...comic, repo } as Comic
      })

      for (const chapter of chapters) {
        await this.db.chapter.create({
          data: { ...chapter, comicId: newComic.id, repo } as Chapter
        })
      }

      return new Promise((resolve) => {
        resolve()
      })
    },

    dbDeleteComic: async ({ comic }): Promise<void> => {
      const comicId = comic.id
      await this.db.readProgress.deleteMany({
        where: { comicId }
      })

      await this.db.chapter.deleteMany({
        where: { comicId }
      })

      await this.db.comic.delete({
        where: {
          id: comicId
        }
      })

      return new Promise((resolve) => resolve())
    },

    //Chapters
    dbGetAllChaptersNoPage: async (): Promise<ChapterInterface[]> => {
      const chapters = (await this.db.chapter.findMany({
        where: { pages: null }
      })) as ChapterInterface[]
      return new Promise((resolve) => {
        resolve(chapters)
      })
    },

    dbGetChapters: async ({ comicId }): Promise<ChapterInterface[]> => {
      const chapters = await this.db.chapter.findMany({ where: { comicId } })
      return new Promise((resolve) => {
        resolve(chapters as ChapterInterface[])
      })
    },

    dbInsertChapters: async ({ chapters }): Promise<void> => {
      for (const chapter of chapters) {
        await this.db.chapter.create({ data: chapter as Chapter })
      }
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbUpdateChapter: async ({ chapter }): Promise<ChapterInterface> => {
      const updatedChapter = (await this.db.chapter.update({
        where: { id: chapter.id },
        data: chapter as Chapter
      })) as ChapterInterface

      return new Promise((resolve) => {
        resolve(updatedChapter)
      })
    },

    //Read Progress
    dbGetReadProgress: async (search): Promise<ReadProgressInterface[]> => {
      //@ts-ignore Multiple ways of searching
      const readProgress = await this.db.readProgress.findMany({ where: search })
      return new Promise((resolve) => {
        resolve(readProgress as ReadProgressInterface[])
      })
    },

    dbUpdateReadProgress: async ({ readProgress }): Promise<void> => {
      if (!readProgress.id) await this.db.readProgress.create({ data: readProgress })
      if (readProgress.id)
        await this.db.readProgress.update({ where: { id: readProgress.id }, data: readProgress })

      return new Promise((resolve) => resolve())
    },

    //Users
    dbGetAllUsers: async (): Promise<UserInterface[]> => {
      const users = await this.db.user.findMany()
      return new Promise((resolve) => {
        resolve(users as UserInterface[])
      })
    },

    dbUpdateUser: async ({ user }): Promise<UserInterface> => {
      const userData = user as User

      const newData = user.id
        ? await this.db.user.update({ where: { id: user.id }, data: userData })
        : await this.db.user.create({ data: userData })

      return new Promise((resolve) => {
        resolve(newData)
      })
    },

    dbDeleteUser: async ({ id }): Promise<void> => {
      await this.db.readProgress.deleteMany({ where: { userId: id } })
      await this.db.user.delete({ where: { id } })
      return new Promise((resolve) => {
        resolve()
      })
    }
  }
}

import { PrismaInitializer } from '../../../lib/prisma'
import { Chapter, Comic, PrismaClient } from '@prisma/client'
import {
  IDBInteractionsRepository,
  IDBInteractionsMethods,
  IDBInteractionsRepositoryInit
} from '../../IDBInteractionsRepository'

export class PrismaDBInteractionsRepository implements IDBInteractionsRepository {
  private db: PrismaClient

  constructor(private data: IDBInteractionsRepositoryInit) {
    const prismaInitializer = new PrismaInitializer(this.data.path)
    this.db = prismaInitializer.prisma
  }

  methods: IDBInteractionsMethods = {
    dbGetComic: async ({ id }): Promise<ComicInterface> => {
      const comic = await this.db.comic.findUnique({ where: { id } })
      return new Promise((resolve) => {
        resolve(comic as ComicInterface)
      })
    },

    dbGetAllComics: async (): Promise<ComicInterface[]> => {
      const comics = (await this.db.comic.findMany()) as ComicInterface[]
      return new Promise((resolve) => {
        resolve(comics)
      })
    },

    dbGetChapters: async ({ comicId }): Promise<ChapterInterface[]> => {
      const chapters = await this.db.chapter.findMany({ where: { comicId } })
      return new Promise((resolve) => {
        resolve(chapters as ChapterInterface[])
      })
    },

    dbInsertComic: async ({ comic, chapters }): Promise<void> => {
      if (!comic.id) {
        const newComic = await this.db.comic.create({
          data: comic as Comic
        })

        for (const chapter of chapters) {
          await this.db.chapter.create({ data: { ...chapter, comicId: newComic.id } as Chapter })
        }

        return new Promise((resolve) => {
          resolve()
        })
      }
    },

    dbInsertChapter: async ({ comicId, chapter }): Promise<void> => {
      await this.db.chapter.create({ data: { ...chapter, comicId } as Chapter })
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbGetReadProgress: async (search): Promise<ReadProgressInterface[]> => {
      //@ts-ignore Multiple ways of searching
      const readProgress = await this.db.readProgress.findMany({ where: search })
      return new Promise((resolve) => {
        resolve(readProgress as ReadProgressInterface[])
      })
    },

    dbUpdateReadProgress: async ({ chapter, comicId, page, userId }): Promise<void> => {
      const chapterId = chapter.id
      const totalPages = JSON.parse(chapter.pages).length

      const data = {
        chapterId,
        userId,
        page,
        comicId,
        totalPages
      }

      const readProgress = await this.db.readProgress.updateMany({
        where: {
          userId,
          chapterId
        },
        data
      })

      if (!readProgress) {
        await this.db.readProgress.create({ data })
      }

      return new Promise((resolve) => resolve())
    }
  }
}

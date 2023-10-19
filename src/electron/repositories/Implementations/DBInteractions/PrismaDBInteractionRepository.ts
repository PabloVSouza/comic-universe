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

    dbInsertChapter: async ({ comicId, chapter }): Promise<void> => {
      await this.db.chapter.create({ data: { ...chapter, comicId } as Chapter })
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

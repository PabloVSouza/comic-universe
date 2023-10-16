import { PrismaInitializer } from '../../../lib/prisma'
import { PrismaClient } from '@prisma/client'
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
    dbGetComic: async ({ id }): Promise<Comic> => {
      const comic = await this.db.comic.findUnique({ where: { id } })
      return new Promise((resolve) => {
        resolve(comic as Comic)
      })
    },

    dbGetAllComics: async (): Promise<Comic[]> => {
      const comics = await this.db.comic.findMany()
      return new Promise((resolve) => {
        resolve(comics as Comic[])
      })
    },

    dbGetChapters: async ({ comicId }): Promise<Chapter[]> => {
      const chapters = await this.db.chapter.findMany({ where: { comicId } })
      return new Promise((resolve) => {
        resolve(chapters as Chapter[])
      })
    },

    dbInsertComic: async ({ comic, chapters }): Promise<void> => {
      if (!comic.id) {
        const newComic = await this.db.comic.create({ data: comic })

        for (const chapter of chapters) {
          await this.db.chapter.create({ data: { ...chapter, comicId: newComic.id } })
        }

        return new Promise((resolve) => {
          resolve()
        })
      }
    },

    dbInsertChapter: async ({ comicId, chapter }): Promise<void> => {
      await this.db.chapter.create({ data: { ...chapter, comicId } })
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbGetReadProgress: async (search): Promise<ReadProgress[]> => {
      console.log(search)
      const readProgress = await this.db.readProgress.findMany({ where: {} })
      return new Promise((resolve) => {
        resolve(readProgress as ReadProgress[])
      })
    },

    dbUpdateReadProgress: async ({ chapter, page }): Promise<void> => {
      return new Promise((resolve) => {
        this.db.ReadProgress.findOne(
          { chapterId: chapter._id },
          (_err, readProgress: ReadProgress) => {
            const data = {
              comicId: chapter.comicId,
              chapterId: chapter._id,
              totalPages: chapter.pages.length - 1,
              page
            } as ReadProgress

            if (!readProgress) {
              this.db.ReadProgress.insert(data, () => {
                resolve()
              })
            } else {
              this.db.ReadProgress.update(
                { chapterId: chapter._id },
                { $set: { page } },
                {},
                () => {
                  resolve()
                }
              )
            }
          }
        )
      })
    }
  }
}

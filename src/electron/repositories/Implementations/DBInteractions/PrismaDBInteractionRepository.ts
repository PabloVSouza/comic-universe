import { PrismaInitializer } from '../../../lib/prisma'
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
      const user = await this.db.user.findUnique({ where: id })
      return new Promise((resolve) => {
        resolve(user)
      })
    },

    dbGetAllComics: async (): Promise<Comic[]> => {
      return new Promise((resolve) => {
        this.db.Comic.find({}, (_err: Error, res: Comic[]) => {
          resolve(res)
        })
      })
    },

    dbGetChapters: async ({ comicId }): Promise<Chapter[]> => {
      return new Promise((resolve) => {
        this.db.Chapter.find({ comicId })
          .sort({ createdAt: 1 })
          .exec((_err, res) => {
            resolve(res)
          })
      })
    },

    dbInsertComic: async ({ comic, chapters }): Promise<void> => {
      if (!comic._id) {
        this.db.Comic.insert(comic, async (_err, data) => {
          const comicDB = data

          for (const chapter of chapters) {
            await this.methods.dbInsertChapter({ chapter: { ...chapter, comicId: comicDB._id } })
          }
          return new Promise((resolve) => {
            resolve()
          })
        })
      }

      const chaptersDbList = await this.methods.dbGetChapters({ comicId: comic._id })

      for (const chapter of chapters) {
        if (!chaptersDbList.find((c) => c.siteId === chapter.siteId)) {
          await this.methods.dbInsertChapter({ chapter: { ...chapter, comicId: comic._id } })
        }
      }
      return new Promise((resolve) => {
        resolve()
      })
    },

    dbInsertChapter: async ({ chapter }): Promise<void> => {
      return new Promise((resolve) => {
        this.db.Chapter.insert(chapter, () => {
          resolve()
        })
      })
    },

    dbGetReadProgress: async (search): Promise<ReadProgress[]> => {
      return new Promise((resolve) => {
        this.db.ReadProgress.find(search, (_err: Error, res: ReadProgress[]) => {
          resolve(res)
        })
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

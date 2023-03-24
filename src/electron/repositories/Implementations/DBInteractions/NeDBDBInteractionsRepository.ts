import { NeDB } from '../../../lib/nedb'

import {
  IDBInteractionsRepository,
  IDBInteractionsMethods,
  IDBInteractionsRepositoryInit
} from '../../IDBInteractionsRepository'

export class NeDBDBInteractionsRepository implements IDBInteractionsRepository {
  private db: NeDB

  constructor(private data: IDBInteractionsRepositoryInit) {
    this.db = new NeDB(this.data.path)
  }

  methods: IDBInteractionsMethods = {
    dbGetComic: async ({ id }): Promise<Comic> => {
      return new Promise((resolve) => {
        this.db.Comic.findOne({ id }, (_err, res) => {
          resolve(res)
        })
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
        return new Promise((resolve) => {
          this.db.Comic.insert(comic, (_err, data) => {
            const comicDB = data

            for (const chapter of chapters) {
              if (!chaptersDbList.find((c) => c.siteId === chapter.siteId)) {
                this.db.Chapter.insert({ ...chapter, comicId: comicDB._id })
              }
            }
          })
          resolve()
        })
      }

      const chaptersDbList = await this.methods.dbGetChapters({ comicId: comic._id })

      return new Promise((resolve) => {
        for (const chapter of chapters) {
          if (!chaptersDbList.find((c) => c.siteId === chapter.siteId)) {
            this.db.Chapter.insert({ ...chapter, comicId: comic._id })
          }
        }
        resolve()
      })
    },

    dbGetReadProgress: async ({ search }): Promise<ReadProgress[]> => {
      return new Promise((resolve) => {
        this.db.ReadProgress.find(search, (_err: Error, res: ReadProgress[]) => {
          resolve(res)
        })
      })
    },

    dbUpdateReadProgress: async ({ comicId, chapter, page }): Promise<void> => {
      return new Promise((resolve) => {
        this.db.ReadProgress.findOne(
          { chapterId: chapter._id },
          (_err, readProgress: ReadProgress) => {
            const data = {
              comicId,
              chapterId: chapter._id,
              totalPages: chapter.pages.length - 1,
              page
            } as ReadProgress

            if (!readProgress)
              this.db.ReadProgress.insert(data, () => {
                resolve()
              })

            this.db.ReadProgress.update({ chapterId: chapter._id }, { $set: { page } }, {}, () => {
              resolve()
            })
          }
        )
      })
    }
  }
}

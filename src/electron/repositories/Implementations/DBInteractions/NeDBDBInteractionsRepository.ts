import { WebContents } from 'electron'
import { NeDB } from '../../../lib/nedb'

import {
  IDBInteractionsRepository,
  IDBInteractionsRepositoryInit
} from '../../IDBInteractionsRepository'

export class NeDBDBInteractionsRepository implements IDBInteractionsRepository {
  private db: NeDB
  private ipc: WebContents

  constructor(private data: IDBInteractionsRepositoryInit) {
    this.db = new NeDB(this.data.path)
    this.ipc = this.data.win.webContents
  }

  methods = {
    dbGetComic: async (id: string): Promise<Comic> => {
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

    dbGetChapters: async (comicId: string): Promise<Chapter[]> => {
      return new Promise((resolve) => {
        this.db.Chapter.find({ comicId })
          .sort({ createdAt: 1 })
          .exec((_err, res) => {
            resolve(res)
          })
      })
    },

    dbInsertComic: async (
      comic: Comic,
      chapter: Chapter
    ): Promise<{ comic: Comic; chapter: Chapter }> => {
      return new Promise((resolve) => {
        let comicDB = comic

        if (!comic._id) {
          this.db.Comic.insert(comic, (_err, data) => {
            comicDB = data
          })
        }

        this.db.Chapter.insert({ ...chapter, comicId: comicDB._id }, (_err, chapterDB) => {
          resolve({ comic: comicDB, chapter: chapterDB })
        })
      })
    },

    dbGetReadProgress: async (search: string): Promise<ReadProgress> => {
      return new Promise((resolve) => {
        this.db.ReadProgress.findOne(search, (_err, res) => {
          resolve(res)
        })
      })
    },

    dbUpdateReadProgress: async (
      comicId: string,
      chapter: Chapter,
      page: number
    ): Promise<void> => {
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

            if (!readProgress) {
              this.db.ReadProgress.insert(data, () => {
                resolve()
              })
            }
            this.db.ReadProgress.update({ chapterId: chapter._id }, { $set: { page } }, {}, () => {
              resolve()
            })
          }
        )
      })
    }
  }
}

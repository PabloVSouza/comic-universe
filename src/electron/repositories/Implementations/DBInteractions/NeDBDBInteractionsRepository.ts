import db from '../../../lib/nedb'

import { IDBInteractionsRepository } from '../../IDBInteractionsRepository'

export class NeDBDBInteractionsRepository implements IDBInteractionsRepository {
  async dbGetComic(id: string): Promise<Comic> {
    return new Promise((resolve) => {
      db.Comic.findOne({ id }, (_err, res) => {
        resolve(res)
      })
    })
  }

  async dbGetAllComics(): Promise<Comic[]> {
    return new Promise((resolve) => {
      db.Comic.find({}, (_err: Error, res: Comic[]) => {
        resolve(res)
      })
    })
  }

  async dbGetChapters(comicId: string): Promise<Chapter[]> {
    return new Promise((resolve) => {
      db.Chapter.find({ comicId })
        .sort({ createdAt: 1 })
        .exec((_err, res) => {
          resolve(res)
        })
    })
  }

  async dbInsertComic(comic: Comic, chapter: Chapter): Promise<{ comic: Comic; chapter: Chapter }> {
    return new Promise((resolve) => {
      let comicDB = comic

      if (!comic._id) {
        db.Comic.insert(comic, (_err, data) => {
          comicDB = data
        })
      }

      db.Chapter.insert({ ...chapter, comicId: comicDB._id }, (_err, chapterDB) => {
        resolve({ comic: comicDB, chapter: chapterDB })
      })
    })
  }

  async dbGetReadProgress(search: string): Promise<ReadProgress> {
    return new Promise((resolve) => {
      db.ReadProgress.findOne(search, (_err, res) => {
        resolve(res)
      })
    })
  }

  async dbUpdateReadProgress(comicId: string, chapter: Chapter, page: number): Promise<void> {
    return new Promise((resolve) => {
      db.ReadProgress.findOne({ chapterId: chapter._id }, (_err, readProgress: ReadProgress) => {
        const data = {
          comicId,
          chapterId: chapter._id,
          totalPages: chapter.pages.length - 1,
          page
        } as ReadProgress

        if (!readProgress) {
          db.ReadProgress.insert(data, () => {
            resolve()
          })
        }
        db.ReadProgress.update({ chapterId: chapter._id }, { $set: { page } }, {}, () => {
          resolve()
        })
      })
    })
  }
}

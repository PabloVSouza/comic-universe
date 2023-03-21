import db from '../../lib/nedb'

export default class DBRepository {
  async getComicDB(id: string): Promise<Comic> {
    if (db.Comic) {
      return new Promise((resolve) => {
        db.Comic.findOne({ id }, (err, res) => {
          resolve(res)
        })
      })
    } else {
      throw 'Database not found'
    }
  }

  async getChaptersDB(comicId: string): Promise<Chapter[]> {
    return new Promise((resolve, reject) => {
      if (db.Chapter) {
        db.Chapter.find({ comicId })
          .sort({ createdAt: 1 })
          .exec((err, res) => {
            if (!err) {
              resolve(res)
            } else {
              reject(err)
            }
          })
      } else {
        throw 'Database not found'
      }
    })
  }

  async getListDB(): Promise<[Comic]> {
    return new Promise((resolve) => {
      if (db.Comic) {
        db.Comic.find({}, (err, result) => {
          resolve(result)
        })
      }
    })
  }

  async createComicDB(
    comic: Comic,
    chapter: Chapter
  ): Promise<{ comic: Comic; chapter: Chapter }> | undefined {
    if (db.Comic && db.Chapter) {
      if (!comic._id) {
        db.Comic.insert({ ...comic, id: String(comic.id) }, (errComic, comicDBData) => {
          if (comicDBData._id) {
            const chapterData = { comicId: comicDBData._id, ...chapter }
            db.Chapter.insert(chapterData, (errChapter, chapterDBData) => {
              return new Promise((resolve, reject) => {
                resolve({ comic: comicDBData, chapterDBData })
              })
            })
          }
        })
      } else {
        if (comic._id) {
          const chapterData = { comicId: comic._id, ...chapter }
          db.Chapter.insert(chapterData, (errChapter, chapterDBData) => {
            return new Promise((resolve, reject) => {
              resolve({ comic, chapterDBData })
            })
          })
        }
      }
    } else {
      throw 'Database not found'
    }
  }

  async changePageDB({ comicId, chapter, page }): Promise<any> {
    return new Promise((resolve) => {
      if (db.ReadProgress) {
        db.ReadProgress.findOne({ chapterId: chapter._id }, (err, currentProgress) => {
          const data = {
            comicId,
            chapterId: chapter._id,
            totalPages: chapter.pages.length - 1,
            page
          }

          if (!currentProgress) {
            db.ReadProgress.insert(data, (err, res) => {
              resolve(res)
            })
          } else {
            db.ReadProgress.update(
              { chapterId: chapter._id },
              { $set: { page } },
              {},
              (err, res) => {
                resolve(res)
              }
            )
          }
        })
      } else {
        throw 'Database not found'
      }
    })
  }

  async getReadProgressDB(search: string): Promise<any> {
    if (db.ReadProgress) {
      return new Promise((resolve) => {
        db.ReadProgress.find(search, (err, res) => {
          resolve(res)
        })
      })
    } else {
      throw 'Database not found'
    }
  }
}

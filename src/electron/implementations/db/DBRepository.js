import db from "../../lib/db";

export default class DBRepository {
  constructor() {}

  async getComicDB(id) {
    if (db.Comic) {
      return new Promise((resolve) => {
        db.Comic.findOne({ id }, (err, res) => {
          resolve(res);
        });
      });
    } else {
      reject("Database not found");
    }
  }

  async getComicChaptersDB(comicId) {
    return new Promise((resolve, reject) => {
      if (db.Chapter) {
        db.Chapter.find({ comicId }, (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            reject(err);
          }
        });
      } else {
        reject("Database not found");
      }
    });
  }

  async createComicDB(comic, chapter) {
    if (db.Comic && db.Chapter) {
      try {
        if (!comic._id) {
          db.Comic.insert(
            { ...comic, id: String(comic.id) },
            (errComic, comicDBData) => {
              if (comicDBData._id) {
                const chapterData = { comicId: comicDBData._id, ...chapter };

                db.Chapter.insert(chapterData, (errChapter, chapterDBData) => {
                  return new Promise((resolve, reject) => {
                    resolve({ comicDBData, chapterDBData });
                  });
                });
              }
            }
          );
        }
      } catch (e) {
        throw e;
      }
    } else {
      throw "Database not found";
    }
  }
}

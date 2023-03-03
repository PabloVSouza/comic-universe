import db from "../../lib/db";

export default class DBRepository {
  constructor() {}

  async getComicDB(id) {
    return new Promise((resolve, reject) => {
      if (db.Comic) {
        db.Comic.findOne({ id }).exec((err, res) => {
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

  async getComicChapters(comicId) {
    return new Promise((resolve, reject) => {
      if (db.Chapter) {
        db.Chapter.find({ id }).exec((err, res) => {
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

  async createComicDB(comic, chapters) {
    if (db.Comic && db.Chapter) {
      try {
        let comicDBData = comic;
        if (!comicDBData._id) {
          comicDBData = await db.Comic.insert(comic).exec();
        }

        if (comicDBData._id) {
          const chaptersData = chapters.reduce((acc, cur) => [
            ...cur,
            { mangaId: comicDBData._id, ...cur },
          ]);

          const chaptersDBData = await db.Chapters.insert(chaptersData).exec();

          return new Promise((resolve, reject) => {
            resolve({ comicDBData, chaptersDBData });
          });
        }
      } catch (e) {
        throw e;
      }
    } else {
      throw "Database not found";
    }
  }
}

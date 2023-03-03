import db from "../../lib/db";

export default class DBRepository {
  constructor() {}

  async getComicDB(id) {
    return new Promise((resolve, reject) => {
      if (db.Comic) {
        db[params.Comic]
          .findOne({ id })
          .sort({ createdAt })
          .exec((err, res) => {
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
    if (db.Comic && db.Chapters) {
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

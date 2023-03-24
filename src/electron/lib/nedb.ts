import Datastore from 'nedb'

export class NeDB {
  Comic: Datastore
  Chapter: Datastore
  User: Datastore
  ReadProgress: Datastore

  constructor(path: string) {
    const params = {
      timestampData: true,
      autoload: true
    }

    this.Comic = new Datastore({
      filename: `${path}/db/Comic.db`,
      ...params
    })

    this.Chapter = new Datastore({
      filename: `${path}/db/Chapter.db`,
      ...params
    })

    this.User = new Datastore({
      filename: `${path}/db/User.db`,
      ...params
    })

    this.ReadProgress = new Datastore({
      filename: `${path}/db/ReadProgress.db`,
      ...params
    })
  }
}

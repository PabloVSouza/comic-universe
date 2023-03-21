import Datastore from 'nedb'
// import { app } from 'electron'

// const Comic = new Datastore({
//   filename: `${app.getPath('userData')}/db/Comic.db`,
//   timestampData: true,
//   autoload: true
// })
// const Chapter = new Datastore({
//   filename: `${app.getPath('userData')}/db/Chapter.db`,
//   timestampData: true,
//   autoload: true
// })

// const User = new Datastore({
//   filename: `${app.getPath('userData')}/db/User.db`,
//   timestampData: true,
//   autoload: true
// })

// const ReadProgress = new Datastore({
//   filename: `${app.getPath('userData')}/db/ReadProgress.db`,
//   timestampData: true,
//   autoload: true
// })

// const db = {
//   Comic,
//   Chapter,
//   User,
//   ReadProgress
// }

// export default db

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

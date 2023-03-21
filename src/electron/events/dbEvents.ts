import { ipcMain, app, BrowserWindow } from 'electron'
import { DBRepository } from '../repositories/Implementations/DBInteractions'
const { handle } = ipcMain

const eventList = (win: BrowserWindow): void => {
  const db = new DBRepository('nedb', app.getPath('userData'), win)

  const properties = Object.getOwnPropertyNames(db.repo.methods)

  for (const method of properties) {
    handle(method, async (_event, data) => db.repo.methods[method](data))
  }
}

export default eventList

import { ipcMain, BrowserWindow } from 'electron'
import { DBInteractionsRepository } from '../repositories/Implementations/DBInteractions'
const { handle } = ipcMain

const dbEvents = (win: BrowserWindow, path: string): void => {
  const db = new DBInteractionsRepository('nedb', { path, win })

  const properties = Object.getOwnPropertyNames(db.repo.methods)

  for (const method of properties) {
    handle(method, async (_event, data) => db.repo.methods[method](data))
  }
}

export default dbEvents

import { ipcMain, BrowserWindow } from 'electron'
import type { Startup } from '../Scripts/Startup'

const dbEvents = (_win: BrowserWindow, startupObject: Startup, _path: string): void => {
  const { repoDBObject } = startupObject

  const properties = Object.getOwnPropertyNames(repoDBObject.repo.methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => repoDBObject.repo.methods[method](data))
  }
}

export default dbEvents

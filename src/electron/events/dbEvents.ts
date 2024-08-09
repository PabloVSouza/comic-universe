import { BrowserWindow, ipcMain } from 'electron'
import type { Startup } from '../Scripts/Startup'

const dbEvents = (startupObject: Startup, _path: string, _win: BrowserWindow): void => {
  const { repoDBObject } = startupObject

  const properties = Object.getOwnPropertyNames(repoDBObject.repo.methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => repoDBObject.repo.methods[method](data))
  }
}

export default dbEvents

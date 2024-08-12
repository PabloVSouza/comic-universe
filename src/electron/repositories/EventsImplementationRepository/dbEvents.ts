import { BrowserWindow, ipcMain } from 'electron'
import type { Startup } from 'scripts/Startup'

const dbEvents = (
  startupObject: Startup,
  _path: string,
  _runningPath: string,
  _win: BrowserWindow
): void => {
  const { repoDBObject } = startupObject

  const properties = Object.getOwnPropertyNames(repoDBObject.methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => repoDBObject.methods[method](data))
  }
}

export default dbEvents

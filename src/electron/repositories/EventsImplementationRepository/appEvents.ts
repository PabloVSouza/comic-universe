import { BrowserWindow, ipcMain } from 'electron'
import type { Startup } from 'scripts/Startup'
import AppRepository from '../Methods/AppRepository'

const dbEvents = (
  startupObject: Startup,
  path: string,
  runningPath: string,
  win: BrowserWindow
): void => {
  const appRepository = new AppRepository(startupObject, path, runningPath, win)

  const properties = Object.getOwnPropertyNames(appRepository.methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => appRepository.methods[method](data))
  }
}

export default dbEvents

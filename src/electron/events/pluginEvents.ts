import { ipcMain, BrowserWindow } from 'electron'
import type { Startup } from '../Scripts/Startup'

const pluginEvents = (_win: BrowserWindow, startupObject: Startup, _path: string): void => {
  const { repoPluginsObject } = startupObject

  const properties = Object.getOwnPropertyNames(repoPluginsObject)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => repoPluginsObject[method](data))
  }
}

export default pluginEvents

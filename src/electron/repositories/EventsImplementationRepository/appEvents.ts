import { BrowserWindow, ipcMain, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { Startup } from 'scripts/Startup'
import pathLib from 'path'
import fs from 'fs'

const appEvents = (
  _startupObject: Startup,
  path: string,
  runningPath: string,
  win: BrowserWindow
): void => {
  ipcMain.handle('getAppData', () => {
    const packageJson = String(fs.readFileSync(__dirname + '/../../package.json'))
    return JSON.parse(packageJson)
  })

  ipcMain.handle('path', (_, args: string[]) => {
    pathLib.join(...args)
  })

  ipcMain.handle('getAppParams', () => {
    const appRunningPath = is.dev ? runningPath : path
    const appPath = path
    const isDev = is.dev

    return { appRunningPath, appPath, isDev }
  })

  ipcMain.handle('maximizeWindow', () => {
    if (!win.isMaximized()) {
      win.maximize()
    } else {
      win.unmaximize()
    }
  })

  ipcMain.handle('closeWindow', () => {
    app.quit()
  })
}

export default appEvents

import { BrowserWindow, ipcMain, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { Startup } from 'scripts/Startup'
import fs from 'fs'

const appEvents = (
  _startupObject: Startup,
  path: string,
  runningPath: string,
  win: BrowserWindow
): void => {
  ipcMain.handle('getAppPath', () => path)

  ipcMain.handle('getAppData', () => {
    const packageJson = String(fs.readFileSync(__dirname + '/../../package.json'))
    return JSON.parse(packageJson)
  })

  ipcMain.handle('getAppRunningPath', () => (is.dev ? runningPath : path))

  ipcMain.handle('getIsDev', () => is.dev)

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

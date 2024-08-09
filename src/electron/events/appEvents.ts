import { BrowserWindow, ipcMain, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { Startup } from '../Scripts/Startup'

const appEvents = (_startupObject: Startup, path: string, win: BrowserWindow): void => {
  ipcMain.handle('getAppPath', () => path)

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

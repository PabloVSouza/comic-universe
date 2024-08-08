import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { Startup } from '../Scripts/Startup'

const appEvents = (win: BrowserWindow, _startupObject: Startup, path: string): void => {
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
    win.close()
  })
}

export default appEvents

import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'

const appEvents = (_win: BrowserWindow, path: string): void => {
  ipcMain.handle('getAppPath', () => path)
  ipcMain.handle('getIsDev', () => is.dev)
  ipcMain.handle('maximizeWindow', () => {
    if (!_win.isMaximized()) {
      _win.maximize()
    } else {
      _win.unmaximize()
    }
  })
}

export default appEvents

import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'

const appEvents = (win: BrowserWindow, path: string): void => {
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

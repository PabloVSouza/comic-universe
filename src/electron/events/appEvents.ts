import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'

const appEvents = (_win: BrowserWindow, path: string): void => {
  ipcMain.handle('getAppPath', () => path)
  ipcMain.handle('getIsDev', () => is.dev)
}

export default appEvents

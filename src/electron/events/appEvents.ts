import { BrowserWindow, ipcMain } from 'electron'

const appEvents = (_win: BrowserWindow, path: string): void => {
  ipcMain.handle('getAppPath', () => path)
}

export default appEvents

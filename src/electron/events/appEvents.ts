import { BrowserWindow, ipcMain } from 'electron'
const { handle } = ipcMain

const appEvents = (_win: BrowserWindow, path: string): void => {
  handle('getAppPath', () => path)
}

export default appEvents

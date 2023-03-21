import { app, ipcMain } from 'electron'

const eventList = (win): void => {
  const { handle } = ipcMain

  handle('getAppPath', () => app.getPath('userData'))
}

export default eventList

import { app, ipcMain } from 'electron'

const eventList = (): void => {
  const { handle } = ipcMain

  handle('getAppPath', () => app.getPath('userData'))
}

export default eventList

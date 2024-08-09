import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import Startup from '../Scripts/Startup'
import CreateMainWindow from '../windows/MainWindow'

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const startUpObjects = await Startup()

  CreateMainWindow(startUpObjects)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      CreateMainWindow(startUpObjects)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

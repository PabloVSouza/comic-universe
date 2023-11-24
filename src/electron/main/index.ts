import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import CreateMainWindow from '../windows/MainWindow'
import { autoUpdater } from 'electron-updater'

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify()
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  CreateMainWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      CreateMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

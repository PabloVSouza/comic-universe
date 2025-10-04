import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import CreateMainWindow from 'windows/MainWindow'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pablovsouza.comic-universe')
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

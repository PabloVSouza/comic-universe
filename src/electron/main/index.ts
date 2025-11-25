import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import DeepLinkHandler from '../utils/DeepLinkHandler'
import CreateMainWindow from '../windows/MainWindow'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pablovsouza.comic-universe')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = CreateMainWindow()

  // Initialize deep link handling for comic-universe:// protocol
  DeepLinkHandler.setupProtocolHandler(mainWindow)
  DeepLinkHandler.setupIpcHandler()

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

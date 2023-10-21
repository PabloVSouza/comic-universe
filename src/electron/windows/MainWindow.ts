import { shell, BrowserWindow, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { createEvents, removeEvents } from '../events'

const CreateMainWindow = async (): Promise<BrowserWindow> => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // frame: false,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: join(__dirname, '../../../resources/icon.png')
  })

  createEvents(mainWindow, app.getPath('userData'))

  let firstLogin = false

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (!firstLogin) {
      mainWindow.webContents.send('changeUrl', '/users')
      firstLogin = true
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', () => {
    removeEvents()
  })

  return mainWindow
}

export default CreateMainWindow

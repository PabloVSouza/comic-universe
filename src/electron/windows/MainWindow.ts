import { shell, BrowserWindow, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import Methods from '../repositories/Methods'
import EventManager from 'repositories/EventManager'
import ApiManager from '../repositories/ApiManager'

const CreateMainWindow = async (): Promise<BrowserWindow> => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 10,
      y: 10
    },
    transparent: true,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: join(__dirname, '../../../resources/logo.svg')
  })

  let eventManager: EventManager
  const initApiEvents = async () => {
    const methods = new Methods(app.getPath('userData'), app.getAppPath(), mainWindow)
    await methods.starUp()

    eventManager = new EventManager(methods.methods)
    new ApiManager(methods)
  }

  initApiEvents()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (!is.dev) autoUpdater.checkForUpdatesAndNotify()

    if (is.dev) mainWindow.webContents.openDevTools()
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
    eventManager.removeEvents()
  })

  return mainWindow
}

export default CreateMainWindow

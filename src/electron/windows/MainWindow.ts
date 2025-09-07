import { shell, BrowserWindow, app, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import Methods from 'repositories/Methods'
import EventManager from 'repositories/EventManager'
import ApiManager from 'repositories/ApiManager'
import SettingsRepository from 'repositories/Methods/SettingsRepository'

// Configure auto-updater
const setupAutoUpdater = (
  mainWindow: BrowserWindow,
  settingsRepository: SettingsRepository
): void => {
  // Configure auto-updater

  // Load user's update preferences from file
  const loadUpdateSettings = async () => {
    try {
      return await settingsRepository.methods.getUpdateSettings()
    } catch (error) {
      console.error('Error loading update settings:', error)
      return {
        autoUpdate: true,
        optInNonStable: false,
        releaseTypes: ['stable']
      }
    }
  }

  // Update available
  autoUpdater.on('update-available', async (info) => {
    const settings = await loadUpdateSettings()

    // Check if user wants this type of update
    const isStable = !info.version.includes('alpha') && !info.version.includes('beta')
    const isBeta = info.version.includes('beta')
    const isAlpha = info.version.includes('alpha')

    let shouldShowUpdate = false

    if (isStable && settings.releaseTypes.includes('stable')) {
      shouldShowUpdate = true
    } else if (isBeta && settings.releaseTypes.includes('beta') && settings.optInNonStable) {
      shouldShowUpdate = true
    } else if (isAlpha && settings.releaseTypes.includes('alpha') && settings.optInNonStable) {
      shouldShowUpdate = true
    }

    if (shouldShowUpdate) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        detail: `Version ${info.version} is available. The update will be downloaded automatically.`,
        buttons: ['OK']
      })
    } else {
      console.log(
        `Update available (${info.version}) but user preferences don't allow this type of update`
      )
    }
  })

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        detail: `Version ${info.version} has been downloaded and is ready to install.`,
        buttons: ['Restart Now', 'Later']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  // Update error
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error)
    dialog.showErrorBox(
      'Update Error',
      `An error occurred while checking for updates: ${error.message}`
    )
  })

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    console.log(message)
    // You can send this to the renderer process if you want to show progress in the UI
    mainWindow.webContents.send('update-download-progress', progressObj)
  })
}

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
      y: 20
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

    // Setup auto-updater with settings repository
    if (!is.dev) {
      // Only setup auto-updater for CI/CD generated versions
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        !currentVersion.includes('-')

      if (isCICDVersion) {
        const settingsRepository = new SettingsRepository()
        setupAutoUpdater(mainWindow, settingsRepository)
        autoUpdater.checkForUpdatesAndNotify()
      }
    }
  }

  initApiEvents()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

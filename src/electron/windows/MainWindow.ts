import { accessSync } from 'fs'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { shell, BrowserWindow, app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import ApiManager from 'repositories/ApiManager'
import EventManager from 'repositories/EventManager'
import Methods from 'repositories/Methods'
import SettingsRepository from 'repositories/Methods/SettingsRepository'

function getVersionTypeString(version: string): string {
  if (version.includes('alpha')) return 'alpha'
  if (version.includes('beta')) return 'beta'
  return 'stable'
}

function isValidUpdateTransition(
  current: { isStable: boolean; isBeta: boolean; isAlpha: boolean },
  available: { isStable: boolean; isBeta: boolean; isAlpha: boolean },
  settings: { optInNonStable: boolean }
): boolean {
  if (settings.optInNonStable) {
    return true
  }

  if (current.isStable && available.isStable) {
    return true
  }

  if (current.isBeta && (available.isBeta || available.isStable)) {
    return true
  }

  if (current.isAlpha && (available.isAlpha || available.isBeta || available.isStable)) {
    return true
  }

  return false
}

const setupAutoUpdater = (
  mainWindow: BrowserWindow,
  settingsRepository: SettingsRepository
): void => {
  autoUpdater.disableDifferentialDownload = true
  autoUpdater.disableWebInstaller = true

  const loadUpdateSettings = async (): Promise<{
    optInNonStable: boolean
  }> => {
    try {
      const settings = await settingsRepository.methods.getUpdateSettings()
      return {
        optInNonStable: settings.optInNonStable
      }
    } catch (error) {
      console.error('Error loading update settings:', error)
      return {
        optInNonStable: false
      }
    }
  }

  autoUpdater.on('update-available', async (info) => {
    const settings = await loadUpdateSettings()
    const currentVersion = app.getVersion()

    const currentIsStable = !currentVersion.includes('alpha') && !currentVersion.includes('beta')
    const currentIsBeta = currentVersion.includes('beta')
    const currentIsAlpha = currentVersion.includes('alpha')

    const availableIsStable = !info.version.includes('alpha') && !info.version.includes('beta')
    const availableIsBeta = info.version.includes('beta')
    const availableIsAlpha = info.version.includes('alpha')

    const isValidTransition = isValidUpdateTransition(
      { isStable: currentIsStable, isBeta: currentIsBeta, isAlpha: currentIsAlpha },
      { isStable: availableIsStable, isBeta: availableIsBeta, isAlpha: availableIsAlpha },
      settings
    )

    if (!isValidTransition) {
      console.log(
        `Update available (${info.version}) but invalid transition from ${currentVersion} (${getVersionTypeString(currentVersion)}) to ${info.version} (${getVersionTypeString(info.version)})`
      )
      return
    }

    let shouldShowUpdate = false

    if (availableIsStable) {
      shouldShowUpdate = true
    } else if ((availableIsBeta || availableIsAlpha) && settings.optInNonStable) {
      shouldShowUpdate = true
    }

    if (shouldShowUpdate) {
      if (process.platform === 'darwin' || process.platform === 'win32') {
        const platformName = process.platform === 'darwin' ? 'macOS' : 'Windows'
        mainWindow.webContents.send('update-available-manual', {
          version: info.version,
          platform: platformName,
          message: `A new version (${info.version}) is available for ${platformName}.`,
          detail: `Auto-updating is disabled on ${platformName} due to code signing requirements.\n\nPlease visit the GitHub releases page to download the latest version manually.\n\nThis ensures a secure and reliable update process.`
        })
      } else {
        mainWindow.webContents.send('update-available-auto', {
          version: info.version,
          message: 'A new version is available. It will be downloaded in the background.',
          detail: `Version ${info.version} is available. The update will be downloaded automatically.`
        })
      }
    } else {
      console.log(
        `Update available (${info.version}) but user preferences don't allow this type of update`
      )
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    if (process.platform !== 'darwin' && process.platform !== 'win32') {
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
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error)
    dialog.showErrorBox(
      'Update Error',
      `An error occurred while checking for updates: ${error.message}`
    )
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    console.log(message)
    mainWindow.webContents.send('update-download-progress', progressObj)
  })
}

const CreateMainWindow = async (): Promise<BrowserWindow> => {
  const isMac = process.platform === 'darwin'
  const isWindows = process.platform === 'win32'

  const getIconPath = (iconName: string): string => {
    const possiblePaths = [
      join(process.resourcesPath, iconName),
      join(process.resourcesPath, 'build', iconName),
      join(__dirname, '../../../build', iconName),
      join(__dirname, '../../build', iconName),
      join(__dirname, '../build', iconName)
    ]

    for (const path of possiblePaths) {
      try {
        accessSync(path)
        return path
      } catch {
        // Path doesn't exist, continue to next
      }
    }

    return possiblePaths[0]
  }

  const iconPath = isWindows ? getIconPath('icon-256.png') : getIconPath('icon.png')

  const windowConfig: Electron.BrowserWindowConstructorOptions = {
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: iconPath
  }

  if (isMac) {
    windowConfig.frame = false
    windowConfig.titleBarStyle = 'hidden'
    windowConfig.trafficLightPosition = {
      x: 10,
      y: 20
    }
    windowConfig.transparent = true
  } else if (isWindows) {
    windowConfig.frame = true
    windowConfig.titleBarStyle = 'default'
  } else {
    windowConfig.frame = true
    windowConfig.titleBarStyle = 'default'
  }

  const mainWindow = new BrowserWindow(windowConfig)

  let eventManager: EventManager
  const initApiEvents = async () => {
    const methods = new Methods(app.getPath('userData'), app.getAppPath(), mainWindow)
    await methods.starUp()

    eventManager = new EventManager(methods.methods)
    const apiManager = new ApiManager(methods)

    methods.setApiManager(apiManager)
    methods.setEventManager(eventManager)

    eventManager.resetEvents()

    if (!is.dev) {
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        currentVersion.includes('dev') ||
        !currentVersion.includes('-')

      if (isCICDVersion) {
        const settingsRepository = new SettingsRepository()

        settingsRepository.methods
          .getUpdateSettings()
          .then((updateSettings) => {
            if (updateSettings.autoUpdate && process.platform === 'linux') {
              setupAutoUpdater(mainWindow, settingsRepository)
              console.log(`Auto-updater enabled for Linux (version: ${currentVersion})`)
              autoUpdater.checkForUpdatesAndNotify()
            } else {
              console.log(
                `Auto-updater disabled - Platform: ${process.platform}, Auto-update enabled: ${updateSettings.autoUpdate}`
              )
            }
          })
          .catch((error) => {
            console.error('Error checking auto-update settings:', error)
            console.log('Auto-updater disabled - could not read settings')
          })
      }
    }
  }

  initApiEvents()

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'Access-Control-Allow-Headers': ['*']
      }
    })
  })

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

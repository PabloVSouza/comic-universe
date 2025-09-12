import { shell, BrowserWindow, app, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import Methods from 'repositories/Methods'
import EventManager from 'repositories/EventManager'
import ApiManager from 'repositories/ApiManager'
import SettingsRepository from 'repositories/Methods/SettingsRepository'

// Helper functions for version type validation
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
  // If user has opted into non-stable releases, allow more flexible transitions
  if (settings.optInNonStable) {
    // Allow any transition when user has opted into non-stable
    return true
  }

  // Default conservative transitions (when optInNonStable is false)
  // Stable can update to stable (newer stable versions)
  if (current.isStable && available.isStable) {
    return true
  }

  // Beta can update to beta (newer beta versions) or stable
  if (current.isBeta && (available.isBeta || available.isStable)) {
    return true
  }

  // Alpha can update to alpha (newer alpha versions), beta, or stable
  if (current.isAlpha && (available.isAlpha || available.isBeta || available.isStable)) {
    return true
  }

  // All other transitions are invalid when not opted into non-stable
  return false
}

// Configure auto-updater
const setupAutoUpdater = (
  mainWindow: BrowserWindow,
  settingsRepository: SettingsRepository
): void => {
  // Configure auto-updater
  // Disable differential download to avoid signature verification issues
  autoUpdater.disableDifferentialDownload = true
  autoUpdater.disableWebInstaller = true

  // Load user's update preferences from file
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

  // Update available
  autoUpdater.on('update-available', async (info) => {
    const settings = await loadUpdateSettings()
    const currentVersion = app.getVersion()

    // Determine current and available version types
    const currentIsStable = !currentVersion.includes('alpha') && !currentVersion.includes('beta')
    const currentIsBeta = currentVersion.includes('beta')
    const currentIsAlpha = currentVersion.includes('alpha')

    const availableIsStable = !info.version.includes('alpha') && !info.version.includes('beta')
    const availableIsBeta = info.version.includes('beta')
    const availableIsAlpha = info.version.includes('alpha')

    // Check if this is a valid update type transition
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

    // Check if user wants this type of update
    let shouldShowUpdate = false

    if (availableIsStable) {
      shouldShowUpdate = true
    } else if ((availableIsBeta || availableIsAlpha) && settings.optInNonStable) {
      shouldShowUpdate = true
    }

    if (shouldShowUpdate) {
      // For macOS and Windows, show manual download dialog instead of auto-download
      if (process.platform === 'darwin' || process.platform === 'win32') {
        const platformName = process.platform === 'darwin' ? 'macOS' : 'Windows'
        // Send message to renderer to show update dialog
        mainWindow.webContents.send('update-available-manual', {
          version: info.version,
          platform: platformName,
          message: `A new version (${info.version}) is available for ${platformName}.`,
          detail: `Auto-updating is disabled on ${platformName} due to code signing requirements.\n\nPlease visit the GitHub releases page to download the latest version manually.\n\nThis ensures a secure and reliable update process.`
        })
      } else {
        // For Linux, use normal auto-update flow
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

  // Update downloaded (only for Linux)
  autoUpdater.on('update-downloaded', (info) => {
    // Only handle update installation for Linux
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
  // Platform-specific window configuration
  const isMac = process.platform === 'darwin'
  const isWindows = process.platform === 'win32'

  const windowConfig: any = {
    width: 900,
    height: 670,
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
    icon: join(__dirname, '../../../resources/logo.svg')
  }

  if (isMac) {
    // macOS: Use custom frame with traffic lights
    windowConfig.frame = false
    windowConfig.titleBarStyle = 'hidden'
    windowConfig.trafficLightPosition = {
      x: 10,
      y: 20
    }
    windowConfig.transparent = true
  } else if (isWindows) {
    // Windows: Use native frame with standard window controls
    windowConfig.frame = true
    windowConfig.titleBarStyle = 'default'
  } else {
    // Linux: Use native frame
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

    // Pass ApiManager instance to AppRepository for server restart functionality
    methods.setApiManager(apiManager)

    // Reset EventManager to use the updated methods
    eventManager.resetEvents()

    // Setup auto-updater with settings repository
    if (!is.dev) {
      // Setup auto-updater for all CI/CD generated versions
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        currentVersion.includes('dev') ||
        !currentVersion.includes('-')

      if (isCICDVersion) {
        // Only setup auto-updater on Linux and when auto-updates are enabled
        const settingsRepository = new SettingsRepository()

        // Check if auto-updates are enabled in settings
        settingsRepository.methods
          .getUpdateSettings()
          .then((updateSettings) => {
            if (updateSettings.autoUpdate && process.platform === 'linux') {
              // Only run auto-updater on Linux when auto-updates are enabled
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
            // Default to disabled if we can't read settings
            console.log('Auto-updater disabled - could not read settings')
          })
      }
    }
  }

  initApiEvents()

  // Disable CORS completely for the session
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

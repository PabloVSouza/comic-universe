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
  settings: any
): boolean {
  // If user has opted into non-stable releases, allow more flexible transitions
  if (settings.optInNonStable) {
    // If user allows alpha releases, allow any transition to alpha
    if (available.isAlpha && settings.releaseTypes.includes('alpha')) {
      return true
    }

    // If user allows beta releases, allow any transition to beta
    if (available.isBeta && settings.releaseTypes.includes('beta')) {
      return true
    }

    // If user allows stable releases, allow any transition to stable
    if (available.isStable && settings.releaseTypes.includes('stable')) {
      return true
    }
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
    const apiManager = new ApiManager(methods)

    // Pass ApiManager instance to AppRepository for server restart functionality
    methods.setApiManager(apiManager)

    // Setup auto-updater with settings repository
    if (!is.dev) {
      // Only setup auto-updater for CI/CD generated versions
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        !currentVersion.includes('-')

      if (isCICDVersion) {
        // Setup auto-updater for all platforms, but handle macOS/Windows differently
        const settingsRepository = new SettingsRepository()
        setupAutoUpdater(mainWindow, settingsRepository)

        if (process.platform === 'darwin' || process.platform === 'win32') {
          // For macOS and Windows, check for updates but show manual download dialog
          console.log(
            `Auto-updater enabled for ${process.platform === 'darwin' ? 'macOS' : 'Windows'} - will show manual download when update available`
          )
          autoUpdater.checkForUpdatesAndNotify()
        } else {
          // For Linux, use normal auto-updater
          autoUpdater.checkForUpdatesAndNotify()
        }
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

import { shell, BrowserWindow, app, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { autoUpdater, UpdateInfo } from 'electron-updater'
import Methods from 'repositories/Methods'
import EventManager from 'repositories/EventManager'
import ApiManager from 'repositories/ApiManager'
import SettingsRepository from 'repositories/Methods/SettingsRepository'
import { FallbackUpdateManager } from '../utils/FallbackUpdateManager'

// Enhanced auto-updater with fallback support
const setupEnhancedAutoUpdater = (
  mainWindow: BrowserWindow,
  settingsRepository: SettingsRepository
): (() => void) => {
  // Configure auto-updater
  autoUpdater.disableDifferentialDownload = true
  autoUpdater.disableWebInstaller = true
  autoUpdater.allowDowngrade = false
  autoUpdater.allowPrerelease = true

  // Initialize fallback update manager
  const fallbackManager = new FallbackUpdateManager(mainWindow)

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

  // Enhanced update available handler
  autoUpdater.on('update-available', async (info: UpdateInfo) => {
    console.log('Update available:', info.version)

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

    if (!shouldShowUpdate) {
      console.log(
        `Update available (${info.version}) but user preferences don't allow this type of update`
      )
      return
    }

    // Use fallback manager to handle the update
    try {
      const result = await fallbackManager.handleUpdateWithFallback(info)

      if (result.success) {
        console.log('Update handled successfully:', result.method)
      } else {
        console.log('Update handling failed:', result.message)
      }
    } catch (error) {
      console.error('Error handling update:', error)

      // Show generic error with fallback option
      const errorResult = await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Update Error',
        message: 'An error occurred while processing the update',
        detail: `Error: ${error}\n\nWould you like to download the update manually?`,
        buttons: ['Download Manually', 'Cancel'],
        defaultId: 0
      })

      if (errorResult.response === 0) {
        shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
      }
    }
  })

  // Update downloaded handler
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
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

  // Enhanced error handler with fallback
  autoUpdater.on('error', async (error: Error) => {
    console.error('Auto-updater error:', error)

    const errorMessage = error.message.toLowerCase()

    // Determine error type and provide appropriate fallback
    if (
      errorMessage.includes('code signature') ||
      errorMessage.includes('certificate') ||
      errorMessage.includes('expired')
    ) {
      // Certificate-related error - show manual download option
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Update Failed - Certificate Issue',
        message: 'Your version is too old for automatic updates',
        detail: `This usually happens when your version is very old (1+ year). Please download the latest version manually from our website.\n\nYour data and settings will be preserved.\n\nError: ${error.message}`,
        buttons: ['Download Manually', 'Download in Background', 'Cancel'],
        defaultId: 0
      })

      if (result.response === 0) {
        // Download manually
        shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
      } else if (result.response === 1) {
        // Download in background (simplified version)
        dialog
          .showMessageBox(mainWindow, {
            type: 'info',
            title: 'Background Download',
            message: 'Opening download page in browser',
            detail:
              'The download will start in your browser. Please install the update when it completes.',
            buttons: ['OK']
          })
          .then(() => {
            shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
          })
      }
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')
    ) {
      // Network-related error
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Update Failed - Network Issue',
        message: 'The update failed due to a network problem',
        detail: `Please check your internet connection and try again, or download the update manually.\n\nError: ${error.message}`,
        buttons: ['Retry', 'Download Manually', 'Cancel'],
        defaultId: 0
      })

      if (result.response === 0) {
        // Retry the update
        setTimeout(() => {
          autoUpdater.checkForUpdatesAndNotify()
        }, 5000)
      } else if (result.response === 1) {
        // Download manually
        shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
      }
    } else {
      // Generic error
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Update Error',
        message: 'An error occurred while checking for updates',
        detail: `Error: ${error.message}\n\nWould you like to download the update manually?`,
        buttons: ['Download Manually', 'Cancel'],
        defaultId: 0
      })

      if (result.response === 0) {
        shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
      }
    }
  })

  // Download progress handler
  autoUpdater.on(
    'download-progress',
    (progressObj: {
      bytesPerSecond: number
      percent: number
      transferred: number
      total: number
    }) => {
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
      console.log(message)

      // Send progress to renderer process
      mainWindow.webContents.send('update-download-progress', progressObj)
    }
  )

  // Check for updates with enhanced error handling
  const checkForUpdatesWithFallback = () => {
    ;(async () => {
      try {
        console.log('Checking for updates...')
        await autoUpdater.checkForUpdatesAndNotify()
      } catch (error) {
        console.error('Error checking for updates:', error)

        // Show fallback option
        const result = await dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: 'Update Check Failed',
          message: 'Could not check for updates automatically',
          detail: `Error: ${error}\n\nWould you like to check for updates manually?`,
          buttons: ['Check Manually', 'Cancel'],
          defaultId: 0
        })

        if (result.response === 0) {
          shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
        }
      }
    })()
  }

  // Return the enhanced check function
  return checkForUpdatesWithFallback
}

const CreateEnhancedMainWindow = async (): Promise<BrowserWindow> => {
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

    // Setup enhanced auto-updater with fallback support
    if (!is.dev) {
      // Only setup auto-updater for CI/CD generated versions
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        !currentVersion.includes('-')

      if (isCICDVersion) {
        const settingsRepository = new SettingsRepository()
        const checkForUpdates = setupEnhancedAutoUpdater(mainWindow, settingsRepository)

        // Check for updates with fallback support
        checkForUpdates()
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

export default CreateEnhancedMainWindow

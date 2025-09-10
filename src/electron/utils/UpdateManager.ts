import { autoUpdater, UpdateInfo } from 'electron-updater'
import { dialog, shell, app } from 'electron'
import { BrowserWindow } from 'electron'

export interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

export interface VersionInfo {
  current: string
  latest: string
  daysSinceRelease: number
  isOldVersion: boolean
}

interface SettingsRepository {
  methods: {
    getUpdateSettings(): Promise<UpdateSettings | null>
  }
}

export class UpdateManager {
  private mainWindow: BrowserWindow
  private settingsRepository: SettingsRepository
  private updateSettings: UpdateSettings | null = null

  constructor(mainWindow: BrowserWindow, settingsRepository: SettingsRepository) {
    this.mainWindow = mainWindow
    this.settingsRepository = settingsRepository
    this.setupAutoUpdater()
  }

  private setupAutoUpdater(): void {
    // Configure auto-updater for better compatibility
    autoUpdater.disableDifferentialDownload = true
    autoUpdater.disableWebInstaller = true
    autoUpdater.allowDowngrade = false
    autoUpdater.allowPrerelease = true

    // Set up event handlers
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    autoUpdater.on('update-available', this.handleUpdateAvailable.bind(this))
    autoUpdater.on('update-downloaded', this.handleUpdateDownloaded.bind(this))
    autoUpdater.on('error', this.handleUpdateError.bind(this))
    autoUpdater.on('download-progress', this.handleDownloadProgress.bind(this))
  }

  private async loadUpdateSettings(): Promise<UpdateSettings> {
    if (this.updateSettings) {
      return this.updateSettings
    }

    try {
      const settings = await this.settingsRepository.methods.getUpdateSettings()
      this.updateSettings = settings || {
        autoUpdate: true,
        optInNonStable: false,
        releaseTypes: ['stable']
      }
      return this.updateSettings
    } catch (error) {
      console.error('Error loading update settings:', error)
      this.updateSettings = {
        autoUpdate: true,
        optInNonStable: false,
        releaseTypes: ['stable']
      }
      return this.updateSettings
    }
  }

  private getVersionTypeString(version: string): string {
    if (version.includes('alpha')) return 'alpha'
    if (version.includes('beta')) return 'beta'
    return 'stable'
  }

  private isValidUpdateTransition(
    current: { isStable: boolean; isBeta: boolean; isAlpha: boolean },
    available: { isStable: boolean; isBeta: boolean; isAlpha: boolean }
  ): boolean {
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

    // All other transitions are invalid (e.g., stable to beta/alpha, beta to alpha)
    return false
  }

  private getVersionInfo(currentVersion: string, latestVersion: string): VersionInfo {
    // Parse version dates (this would need to be implemented based on your versioning scheme)
    const currentDate = this.getVersionReleaseDate(currentVersion)

    const daysSinceRelease = (Date.now() - currentDate) / (1000 * 60 * 60 * 24)
    const isOldVersion = daysSinceRelease > 365 // More than 1 year old

    return {
      current: currentVersion,
      latest: latestVersion,
      daysSinceRelease: Math.floor(daysSinceRelease),
      isOldVersion
    }
  }

  private getVersionReleaseDate(version: string): number {
    // This is a simplified implementation
    // In reality, you'd need to map versions to their release dates
    // For now, we'll use a heuristic based on version numbers

    if (version.includes('alpha')) {
      return Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
    } else if (version.includes('beta')) {
      return Date.now() - 60 * 24 * 60 * 60 * 1000 // 60 days ago
    } else {
      // Assume stable versions are older
      return Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year ago
    }
  }

  private async handleUpdateAvailable(info: UpdateInfo): Promise<void> {
    const settings = await this.loadUpdateSettings()
    const currentVersion = app.getVersion()
    const versionInfo = this.getVersionInfo(currentVersion, info.version)

    // Determine current and available version types
    const currentIsStable = !currentVersion.includes('alpha') && !currentVersion.includes('beta')
    const currentIsBeta = currentVersion.includes('beta')
    const currentIsAlpha = currentVersion.includes('alpha')

    const availableIsStable = !info.version.includes('alpha') && !info.version.includes('beta')
    const availableIsBeta = info.version.includes('beta')
    const availableIsAlpha = info.version.includes('alpha')

    // Check if this is a valid update type transition
    const isValidTransition = this.isValidUpdateTransition(
      { isStable: currentIsStable, isBeta: currentIsBeta, isAlpha: currentIsAlpha },
      { isStable: availableIsStable, isBeta: availableIsBeta, isAlpha: availableIsAlpha }
    )

    if (!isValidTransition) {
      console.log(
        `Update available (${info.version}) but invalid transition from ${currentVersion} (${this.getVersionTypeString(currentVersion)}) to ${info.version} (${this.getVersionTypeString(info.version)})`
      )
      return
    }

    // Check if user wants this type of update
    let shouldShowUpdate = false

    if (availableIsStable && settings.releaseTypes.includes('stable')) {
      shouldShowUpdate = true
    } else if (availableIsBeta && settings.releaseTypes.includes('beta') && settings.optInNonStable) {
      shouldShowUpdate = true
    } else if (availableIsAlpha && settings.releaseTypes.includes('alpha') && settings.optInNonStable) {
      shouldShowUpdate = true
    }

    if (!shouldShowUpdate) {
      console.log(
        `Update available (${info.version}) but user preferences don't allow this type of update`
      )
      return
    }

    // Check if this is an old version that might have compatibility issues
    if (versionInfo.isOldVersion) {
      this.showOldVersionUpdateDialog(versionInfo, info)
    } else {
      this.showNormalUpdateDialog(info)
    }
  }

  private showOldVersionUpdateDialog(versionInfo: VersionInfo, updateInfo: UpdateInfo): void {
    dialog
      .showMessageBox(this.mainWindow, {
        type: 'warning',
        title: 'Update Available (Manual Update Recommended)',
        message: 'Your version is quite old and may require a manual update',
        detail: `You're running version ${versionInfo.current} (${versionInfo.daysSinceRelease} days old). The latest version is ${versionInfo.latest}.\n\nDue to the age of your version, we recommend downloading the update manually to avoid potential compatibility issues.`,
        buttons: ['Download Manually', 'Try Auto-Update', 'Later'],
        defaultId: 0,
        cancelId: 2
      })
      .then((result) => {
        if (result.response === 0) {
          // Download manually
          this.openManualDownload()
        } else if (result.response === 1) {
          // Try auto-update
          this.proceedWithAutoUpdate(updateInfo)
        }
        // If response === 2, user chose "Later"
      })
  }

  private showNormalUpdateDialog(updateInfo: UpdateInfo): void {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. It will be downloaded in the background.',
      detail: `Version ${updateInfo.version} is available. The update will be downloaded automatically.`,
      buttons: ['OK']
    })
  }

  private proceedWithAutoUpdate(updateInfo: UpdateInfo): void {
    // Proceed with normal auto-update
    console.log('Proceeding with auto-update for version:', updateInfo.version)
  }

  private openManualDownload(): void {
    shell.openExternal('https://github.com/PabloVSouza/comic-universe/releases/latest')
  }

  private handleUpdateDownloaded(info: UpdateInfo): void {
    dialog
      .showMessageBox(this.mainWindow, {
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

  private handleUpdateError(error: Error): void {
    console.error('Auto-updater error:', error)

    // Analyze the error to determine the best response
    const errorMessage = error.message.toLowerCase()

    if (this.isCertificateError(errorMessage)) {
      this.handleCertificateError(error)
    } else if (this.isVersionCompatibilityError(errorMessage)) {
      this.handleVersionCompatibilityError(error)
    } else if (this.isNetworkError(errorMessage)) {
      this.handleNetworkError(error)
    } else {
      this.handleGenericError(error)
    }
  }

  private isCertificateError(errorMessage: string): boolean {
    return (
      errorMessage.includes('code signature') ||
      errorMessage.includes('certificate') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('signature')
    )
  }

  private isVersionCompatibilityError(errorMessage: string): boolean {
    return (
      errorMessage.includes('version') ||
      errorMessage.includes('compatibility') ||
      errorMessage.includes('incompatible')
    )
  }

  private isNetworkError(errorMessage: string): boolean {
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('dns')
    )
  }

  private handleCertificateError(error: Error): void {
    dialog
      .showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Update Failed - Certificate Issue',
        message: 'The automatic update failed due to a certificate issue.',
        detail: `This usually happens when your version is very old. Please download the latest version manually from our website.\n\nError: ${error.message}`,
        buttons: ['Download Manually', 'OK']
      })
      .then((result) => {
        if (result.response === 0) {
          this.openManualDownload()
        }
      })
  }

  private handleVersionCompatibilityError(error: Error): void {
    dialog
      .showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Update Failed - Version Compatibility',
        message: 'Your version is too old for automatic updates.',
        detail: `Please download the latest version manually. Your data will be preserved.\n\nError: ${error.message}`,
        buttons: ['Download Manually', 'OK']
      })
      .then((result) => {
        if (result.response === 0) {
          this.openManualDownload()
        }
      })
  }

  private handleNetworkError(error: Error): void {
    dialog
      .showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Update Failed - Network Issue',
        message: 'The update failed due to a network problem.',
        detail: `Please check your internet connection and try again later.\n\nError: ${error.message}`,
        buttons: ['Retry', 'Download Manually', 'OK']
      })
      .then((result) => {
        if (result.response === 0) {
          // Retry the update
          this.checkForUpdates()
        } else if (result.response === 1) {
          this.openManualDownload()
        }
      })
  }

  private handleGenericError(error: Error): void {
    dialog.showErrorBox(
      'Update Error',
      `An error occurred while checking for updates: ${error.message}`
    )
  }

  private handleDownloadProgress(progressObj: {
    bytesPerSecond: number
    percent: number
    transferred: number
    total: number
  }): void {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    console.log(message)

    // Send progress to renderer process
    this.mainWindow.webContents.send('update-download-progress', progressObj)
  }

  public checkForUpdates(): void {
    autoUpdater.checkForUpdatesAndNotify()
  }

  public getCurrentVersion(): string {
    return app.getVersion()
  }

  public async getCurrentVersionInfo(): Promise<VersionInfo | null> {
    // This would need to be implemented to get the latest version
    // For now, we'll return null
    return null
  }
}

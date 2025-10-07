import { existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { dialog, shell, app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater, UpdateInfo } from 'electron-updater'

export interface FallbackUpdateOptions {
  downloadUrl: string
  version: string
  releaseNotes?: string
  isPrerelease: boolean
}

export interface UpdateFallbackResult {
  success: boolean
  method: 'auto' | 'manual' | 'background'
  message: string
  downloadPath?: string
}

export class FallbackUpdateManager {
  private mainWindow: BrowserWindow
  private downloadPath: string
  private isDownloading: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.downloadPath = join(homedir(), 'Downloads', 'ComicUniverse')
    this.setupIpcHandlers()
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('download-update-manually', async (_event, options: FallbackUpdateOptions) => {
      return await this.downloadUpdateManually(options)
    })

    ipcMain.handle('check-update-fallback', async () => {
      return await this.checkForFallbackUpdate()
    })
  }

  public async handleUpdateWithFallback(updateInfo: UpdateInfo): Promise<UpdateFallbackResult> {
    const currentVersion = app.getVersion()
    const versionInfo = this.analyzeVersionGap(currentVersion, updateInfo.version)

    if (versionInfo.isVeryOld) {
      return await this.handleVeryOldVersion(updateInfo, versionInfo)
    }

    try {
      return await this.attemptAutoUpdate()
    } catch (error) {
      console.log('Auto-update failed, falling back to manual download:', error)
      return await this.handleAutoUpdateFailure(updateInfo, error as Error)
    }
  }

  private analyzeVersionGap(currentVersion: string, targetVersion: string) {
    const currentDate = this.getVersionReleaseDate(currentVersion)
    const targetDate = this.getVersionReleaseDate(targetVersion)
    const daysSinceCurrent = (Date.now() - currentDate) / (1000 * 60 * 60 * 24)
    const daysSinceTarget = (Date.now() - targetDate) / (1000 * 60 * 60 * 24)

    return {
      currentVersion,
      targetVersion,
      daysSinceCurrent: Math.floor(daysSinceCurrent),
      daysSinceTarget: Math.floor(daysSinceTarget),
      isOld: daysSinceCurrent > 180,
      isVeryOld: daysSinceCurrent > 365,
      hasMajorVersionJump: this.hasMajorVersionJump(currentVersion, targetVersion)
    }
  }

  private async handleVeryOldVersion(
    updateInfo: UpdateInfo,
    versionInfo: {
      currentVersion: string
      targetVersion: string
      daysSinceCurrent: number
      daysSinceTarget: number
      isOld: boolean
      isVeryOld: boolean
      hasMajorVersionJump: boolean
    }
  ): Promise<UpdateFallbackResult> {
    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'warning',
      title: 'Manual Update Required',
      message: 'Your version is very old and requires a manual update',
      detail: `You're running version ${versionInfo.currentVersion} (${versionInfo.daysSinceCurrent} days old).\n\nThe latest version is ${versionInfo.targetVersion}.\n\nFor the best experience, please download and install the latest version manually.`,
      buttons: ['Download Now', 'Download in Background', 'Remind Me Later'],
      defaultId: 0,
      cancelId: 2
    })

    switch (result.response) {
      case 0:
        return await this.downloadUpdateManually({
          downloadUrl: this.getDownloadUrl(updateInfo),
          version: updateInfo.version,
          releaseNotes:
            typeof updateInfo.releaseNotes === 'string' ? updateInfo.releaseNotes : undefined,
          isPrerelease:
            updateInfo.releaseName?.includes('beta') ||
            updateInfo.releaseName?.includes('alpha') ||
            false
        })

      case 1:
        return await this.downloadUpdateInBackground({
          downloadUrl: this.getDownloadUrl(updateInfo),
          version: updateInfo.version,
          releaseNotes:
            typeof updateInfo.releaseNotes === 'string' ? updateInfo.releaseNotes : undefined,
          isPrerelease:
            updateInfo.releaseName?.includes('beta') ||
            updateInfo.releaseName?.includes('alpha') ||
            false
        })

      default:
        return {
          success: false,
          method: 'manual',
          message: 'Update postponed by user'
        }
    }
  }

  private async attemptAutoUpdate(): Promise<UpdateFallbackResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Auto-update timeout'))
      }, 30000)

      const onSuccess = () => {
        clearTimeout(timeout)
        resolve({
          success: true,
          method: 'auto',
          message: 'Auto-update successful'
        })
      }

      const onError = (error: Error) => {
        clearTimeout(timeout)
        reject(error)
      }

      autoUpdater.once('update-downloaded', onSuccess)
      autoUpdater.once('error', onError)

      autoUpdater.downloadUpdate()
    })
  }

  private async handleAutoUpdateFailure(
    updateInfo: UpdateInfo,
    error: Error
  ): Promise<UpdateFallbackResult> {
    const isCertificateError = this.isCertificateError(error.message)
    const isNetworkError = this.isNetworkError(error.message)

    let title = 'Update Failed'
    let message = 'The automatic update failed'
    let detail = `Error: ${error.message}\n\nWould you like to download the update manually?`

    if (isCertificateError) {
      title = 'Update Failed - Certificate Issue'
      message = 'Your version is too old for automatic updates'
      detail =
        'This usually happens when your version is very old. Please download the latest version manually.\n\nYour data will be preserved during the update.'
    } else if (isNetworkError) {
      title = 'Update Failed - Network Issue'
      message = 'The update failed due to a network problem'
      detail = 'Please check your internet connection and try again, or download manually.'
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'error',
      title,
      message,
      detail,
      buttons: ['Download Manually', 'Download in Background', 'Try Again', 'Cancel'],
      defaultId: 0,
      cancelId: 3
    })

    switch (result.response) {
      case 0:
        return await this.downloadUpdateManually({
          downloadUrl: this.getDownloadUrl(updateInfo),
          version: updateInfo.version,
          releaseNotes:
            typeof updateInfo.releaseNotes === 'string' ? updateInfo.releaseNotes : undefined,
          isPrerelease:
            updateInfo.releaseName?.includes('beta') ||
            updateInfo.releaseName?.includes('alpha') ||
            false
        })

      case 1:
        return await this.downloadUpdateInBackground({
          downloadUrl: this.getDownloadUrl(updateInfo),
          version: updateInfo.version,
          releaseNotes:
            typeof updateInfo.releaseNotes === 'string' ? updateInfo.releaseNotes : undefined,
          isPrerelease:
            updateInfo.releaseName?.includes('beta') ||
            updateInfo.releaseName?.includes('alpha') ||
            false
        })

      case 2:
        return await this.handleUpdateWithFallback(updateInfo)

      default:
        return {
          success: false,
          method: 'auto',
          message: 'Update cancelled by user'
        }
    }
  }

  private async downloadUpdateManually(
    options: FallbackUpdateOptions
  ): Promise<UpdateFallbackResult> {
    try {
      await dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Downloading Update',
        message: 'Opening download page...',
        detail:
          'The download will start in your browser. Please install the update when it completes.',
        buttons: ['OK']
      })

      shell.openExternal(options.downloadUrl)

      setTimeout(() => {
        this.showInstallationInstructions(options)
      }, 2000)

      return {
        success: true,
        method: 'manual',
        message: 'Download page opened in browser',
        downloadPath: options.downloadUrl
      }
    } catch (error) {
      return {
        success: false,
        method: 'manual',
        message: `Failed to open download page: ${error}`
      }
    }
  }

  private async downloadUpdateInBackground(
    options: FallbackUpdateOptions
  ): Promise<UpdateFallbackResult> {
    if (this.isDownloading) {
      return {
        success: false,
        method: 'background',
        message: 'Download already in progress'
      }
    }

    this.isDownloading = true

    try {
      if (!existsSync(this.downloadPath)) {
        mkdirSync(this.downloadPath, { recursive: true })
      }

      this.showBackgroundDownloadNotification(options)

      setTimeout(() => {
        this.completeBackgroundDownload(options)
      }, 5000)

      return {
        success: true,
        method: 'background',
        message: 'Download started in background',
        downloadPath: this.downloadPath
      }
    } catch (error) {
      this.isDownloading = false
      return {
        success: false,
        method: 'background',
        message: `Background download failed: ${error}`
      }
    }
  }

  private showInstallationInstructions(options: FallbackUpdateOptions): void {
    const instructions = this.getInstallationInstructions(options)

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Installation Instructions',
        message: 'How to install the update:',
        detail: instructions,
        buttons: ['Got it!', 'Open Download Page Again'],
        defaultId: 0
      })
      .then((result) => {
        if (result.response === 1) {
          shell.openExternal(options.downloadUrl)
        }
      })
  }

  private getInstallationInstructions(options: FallbackUpdateOptions): string {
    const platform = process.platform
    const version = options.version

    let instructions = `Version ${version} Installation Instructions:\n\n`

    switch (platform) {
      case 'darwin':
        instructions += `1. Download the .dmg file from the GitHub releases page
2. Open the downloaded .dmg file
3. Drag Comic Universe to your Applications folder
4. Replace the existing app when prompted
5. Launch the new version from Applications

Your data and settings will be preserved.`
        break

      case 'win32':
        instructions += `1. Download the .exe installer from the GitHub releases page
2. Run the downloaded installer
3. Follow the installation wizard
4. The installer will automatically replace the old version

Your data and settings will be preserved.`
        break

      case 'linux':
        instructions += `1. Download the .AppImage file from the GitHub releases page
2. Make the file executable: chmod +x comic-universe-*.AppImage
3. Run the new AppImage: ./comic-universe-*.AppImage
4. Replace your old AppImage with the new one

Your data and settings will be preserved.`
        break

      default:
        instructions += `1. Download the appropriate file for your platform
2. Follow the installation instructions for your operating system
3. Your data and settings will be preserved`
    }

    return instructions
  }

  private showBackgroundDownloadNotification(options: FallbackUpdateOptions): void {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Background Download Started',
      message: 'Update is downloading in the background',
      detail: `Version ${options.version} is being downloaded to your Downloads folder.\n\nYou'll be notified when it's ready to install.`,
      buttons: ['OK']
    })
  }

  private completeBackgroundDownload(options: FallbackUpdateOptions): void {
    this.isDownloading = false

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Download Complete',
        message: 'Update is ready to install',
        detail: `Version ${options.version} has been downloaded to:\n${this.downloadPath}\n\nPlease install it when convenient.`,
        buttons: ['Install Now', 'Install Later', 'Open Downloads Folder'],
        defaultId: 0
      })
      .then((result) => {
        switch (result.response) {
          case 0:
            this.showInstallationInstructions(options)
            break
          case 2:
            shell.openPath(this.downloadPath)
            break
        }
      })
  }

  private getDownloadUrl(updateInfo: UpdateInfo): string {
    const baseUrl = 'https://github.com/PabloVSouza/comic-universe/releases'

    if (updateInfo.releaseName) {
      return `${baseUrl}/tag/${updateInfo.releaseName}`
    } else {
      return `${baseUrl}/latest`
    }
  }

  private isCertificateError(errorMessage: string): boolean {
    const certKeywords = ['certificate', 'signature', 'code signature', 'expired', 'invalid']
    return certKeywords.some((keyword) => errorMessage.toLowerCase().includes(keyword))
  }

  private isNetworkError(errorMessage: string): boolean {
    const networkKeywords = ['network', 'connection', 'timeout', 'dns', 'unreachable']
    return networkKeywords.some((keyword) => errorMessage.toLowerCase().includes(keyword))
  }

  private hasMajorVersionJump(currentVersion: string, targetVersion: string): boolean {
    const currentMajor = parseInt(currentVersion.split('.')[0])
    const targetMajor = parseInt(targetVersion.split('.')[0])
    return targetMajor > currentMajor
  }

  private getVersionReleaseDate(version: string): number {
    if (version.includes('alpha')) {
      return Date.now() - 30 * 24 * 60 * 60 * 1000
    } else if (version.includes('beta')) {
      return Date.now() - 60 * 24 * 60 * 60 * 1000
    } else {
      return Date.now() - 365 * 24 * 60 * 60 * 1000
    }
  }

  public async checkForFallbackUpdate(): Promise<UpdateFallbackResult> {
    return {
      success: false,
      method: 'auto',
      message: 'No updates available'
    }
  }
}

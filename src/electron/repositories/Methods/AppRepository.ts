import { BrowserWindow, app, shell } from 'electron'
import pathLib from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import SettingsRepository, { LanguageSettings, UpdateSettings, WebUISettings } from './SettingsRepository'

class AppRepository {
  private settingsRepository: SettingsRepository

  constructor(
    public appPath: string,
    public runningPath: string,
    public win: BrowserWindow
  ) {
    this.settingsRepository = new SettingsRepository()
  }

  public methods = {
    getAppData: () => {
      const packageJson = String(fs.readFileSync(__dirname + '/../../package.json'))
      return JSON.parse(packageJson)
    },

    path: (args: string[]) => {
      pathLib.join(...args)
    },

    getAppParams: () => {
      const appRunningPath = is.dev ? this.runningPath : this.appPath
      const { appPath } = this
      const isDev = is.dev

      return { appRunningPath, appPath, isDev }
    },

    maximizeWindow: () => {
      if (!this.win.isMaximized()) {
        this.win.maximize()
      } else {
        this.win.unmaximize()
      }
    },

    closeWindow: () => {
      app.quit()
    },

    checkForUpdates: async () => {
      if (is.dev) {
        return { message: 'Updates are not checked in development mode' }
      }

      // Only check for updates if this is a CI/CD generated version
      // (not a dev build or manually built version)
      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        !currentVersion.includes('-')

      if (!isCICDVersion) {
        return { message: 'Update checking is only available for CI/CD generated releases' }
      }

      try {
        // Load user's update preferences from file
        const settings = await this.settingsRepository.methods.getUpdateSettings()

        if (!settings.autoUpdate) {
          return { message: 'Auto-update is disabled in settings' }
        }

        const result = await autoUpdater.checkForUpdates()
        return {
          message: result ? 'Update check initiated' : 'No updates available',
          updateInfo: result?.updateInfo,
          settings: settings
        }
      } catch (error) {
        return {
          message: 'Error checking for updates',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },

    getAppVersion: () => {
      const currentVersion = app.getVersion()

      // In development, show version with -dev suffix
      if (is.dev) {
        const majorVersion = currentVersion.split('.')[0]
        return `${majorVersion}.0.0-dev`
      }

      // In production, return the actual version from package.json
      // This version is updated by CI/CD when releases are created
      return currentVersion
    },

    // Language settings methods
    getLanguageSettings: async () => {
      return await this.settingsRepository.methods.getLanguageSettings()
    },

    updateLanguageSettings: async (args: { languageSettings: unknown }) => {
      return await this.settingsRepository.methods.updateLanguageSettings(
        args.languageSettings as Partial<LanguageSettings>
      )
    },

    // Update settings methods
    getUpdateSettings: async () => {
      return await this.settingsRepository.methods.getUpdateSettings()
    },

    updateUpdateSettings: async (args: { updateSettings: unknown }) => {
      return await this.settingsRepository.methods.updateUpdateSettingsInternal(
        args.updateSettings as Partial<UpdateSettings>
      )
    },

    // Web UI settings methods
    getWebUISettings: async () => {
      return await this.settingsRepository.methods.getWebUISettings()
    },

    updateWebUISettings: async (args: { webUISettings: unknown }) => {
      return await this.settingsRepository.methods.updateWebUISettings(
        args.webUISettings as Partial<WebUISettings>
      )
    },

    openExternal: (args: { url: string }) => {
      shell.openExternal(args.url)
    }
  }
}

export default AppRepository

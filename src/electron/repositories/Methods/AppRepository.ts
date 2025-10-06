import fs from 'fs'
import pathLib from 'path'
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, app, shell, dialog, OpenDialogOptions } from 'electron'
import { autoUpdater } from 'electron-updater'
import SettingsRepository, {
  LanguageSettings,
  UpdateSettings,
  WebUISettings
} from './SettingsRepository'

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

      const currentVersion = app.getVersion()
      const isCICDVersion =
        currentVersion.includes('alpha') ||
        currentVersion.includes('beta') ||
        !currentVersion.includes('-')

      if (!isCICDVersion) {
        return { message: 'Update checking is only available for CI/CD generated releases' }
      }

      try {
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

      if (is.dev) {
        const majorVersion = currentVersion.split('.')[0]
        return `${majorVersion}.0.0-dev`
      }

      return currentVersion
    },

    getPlatform: () => {
      return process.platform
    },

    getLanguageSettings: async () => {
      return await this.settingsRepository.methods.getLanguageSettings()
    },

    updateLanguageSettings: async (args: { languageSettings: unknown }) => {
      return await this.settingsRepository.methods.updateLanguageSettings(
        args.languageSettings as Partial<LanguageSettings>
      )
    },

    getUpdateSettings: async () => {
      return await this.settingsRepository.methods.getUpdateSettings()
    },

    updateUpdateSettings: async (args: { updateSettings: unknown }) => {
      return await this.settingsRepository.methods.updateUpdateSettingsInternal(
        args.updateSettings as Partial<UpdateSettings>
      )
    },

    getWebUISettings: async () => {
      return await this.settingsRepository.methods.getWebUISettings()
    },

    updateWebUISettings: async (args: {
      webUISettings: Partial<WebUISettings> | { webUISettings: Partial<WebUISettings> }
    }) => {
      const settings =
        (args.webUISettings as { webUISettings: Partial<WebUISettings> })?.webUISettings ||
        (args.webUISettings as Partial<WebUISettings>)
      return await this.settingsRepository.methods.updateWebUISettings(settings)
    },

    restartApiServer: async () => {
      return { message: 'API server restart requested' }
    },

    getWebUIPort: async () => {
      return { port: null }
    },

    openExternal: (args: { url: string }) => {
      shell.openExternal(args.url)
    },

    showOpenDialog: async (options: OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(this.win, options)
      return result
    }
  }
}

export default AppRepository

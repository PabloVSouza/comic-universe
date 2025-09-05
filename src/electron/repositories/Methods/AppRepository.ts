import { BrowserWindow, app } from 'electron'
import pathLib from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import SettingsRepository from './SettingsRepository'

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
      return app.getVersion()
    }
  }
}

export default AppRepository

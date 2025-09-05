import { BrowserWindow, app } from 'electron'
import pathLib from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

class AppRepository {
  constructor(
    public appPath: string,
    public runningPath: string,
    public win: BrowserWindow
  ) {}

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
        const result = await autoUpdater.checkForUpdates()
        return { 
          message: result ? 'Update check initiated' : 'No updates available',
          updateInfo: result?.updateInfo
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

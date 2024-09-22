import { BrowserWindow, app } from 'electron'
import type { Startup } from 'scripts/Startup'
import pathLib from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'

class AppRepository {
  constructor(
    _startupObject: Startup,
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
    }
  }
}

export default AppRepository

import fs from 'fs'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { app } from 'electron'


class DataPaths {
  private static projectRoot: string | null = null

  
  public static resetCache(): void {
    this.projectRoot = null
  }

  
  private static getProjectRoot(): string {
    if (!this.projectRoot) {
      if (is.dev) {
        this.projectRoot = path.resolve(__dirname, '../../')
      } else {
        this.projectRoot = app.getAppPath()
      }
    }
    return this.projectRoot
  }

  
  public static getBaseDataPath(): string {
    if (is.dev) {
      return path.join(this.getProjectRoot(), 'dev-data')
    } else {
      return app.getPath('userData')
    }
  }

  
  public static getSettingsPath(): string {
    const basePath = this.getBaseDataPath()
    return is.dev ? path.join(basePath, 'settings') : basePath
  }

  
  public static getDatabasePath(): string {
    const basePath = this.getBaseDataPath()
    return is.dev ? path.join(basePath, 'database') : path.join(basePath, 'db')
  }

  
  public static getPluginsPath(): string {
    return path.join(this.getBaseDataPath(), 'plugins')
  }

  
  public static getSettingsFilePath(): string {
    return path.join(this.getSettingsPath(), 'settings.json')
  }

  
  public static getDatabaseFilePath(): string {
    return path.join(this.getDatabasePath(), 'database.db')
  }

  
  public static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  
  public static ensureAllDirectoriesExist(): void {
    this.ensureDirectoryExists(this.getBaseDataPath())
    this.ensureDirectoryExists(this.getSettingsPath())
    this.ensureDirectoryExists(this.getDatabasePath())
    this.ensureDirectoryExists(this.getPluginsPath())
  }
}

export default DataPaths

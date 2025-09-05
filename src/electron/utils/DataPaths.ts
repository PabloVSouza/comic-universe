import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'

/**
 * Utility class for managing data paths in development and production
 */
class DataPaths {
  private static projectRoot: string | null = null

  /**
   * Reset the cached project root (useful for debugging)
   */
  public static resetCache(): void {
    this.projectRoot = null
  }

  /**
   * Get the project root directory
   */
  private static getProjectRoot(): string {
    if (!this.projectRoot) {
      if (is.dev) {
        // In development, resolve from the compiled output directory
        // out/main -> project root (go up 2 levels)
        this.projectRoot = path.resolve(__dirname, '../../')
      } else {
        // In production, use the app path
        this.projectRoot = app.getAppPath()
      }
    }
    return this.projectRoot
  }

  /**
   * Get the base data directory path
   * In development: ./dev-data/
   * In production: Application Support folder
   */
  public static getBaseDataPath(): string {
    if (is.dev) {
      return path.join(this.getProjectRoot(), 'dev-data')
    } else {
      return app.getPath('userData')
    }
  }

  /**
   * Get the settings directory path
   * In development: ./dev-data/settings/
   * In production: Application Support/settings/
   */
  public static getSettingsPath(): string {
    const basePath = this.getBaseDataPath()
    return is.dev ? path.join(basePath, 'settings') : basePath
  }

  /**
   * Get the database directory path
   * In development: ./dev-data/database/
   * In production: Application Support/db/
   */
  public static getDatabasePath(): string {
    const basePath = this.getBaseDataPath()
    return is.dev ? path.join(basePath, 'database') : path.join(basePath, 'db')
  }

  /**
   * Get the plugins directory path
   * In development: ./dev-data/plugins/
   * In production: Application Support/plugins/
   */
  public static getPluginsPath(): string {
    return path.join(this.getBaseDataPath(), 'plugins')
  }

  /**
   * Get the full path to the settings file
   */
  public static getSettingsFilePath(): string {
    return path.join(this.getSettingsPath(), 'settings.json')
  }

  /**
   * Get the full path to the database file
   */
  public static getDatabaseFilePath(): string {
    return path.join(this.getDatabasePath(), 'database.db')
  }

  /**
   * Ensure a directory exists, creating it if necessary
   */
  public static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * Ensure all data directories exist
   */
  public static ensureAllDirectoriesExist(): void {
    this.ensureDirectoryExists(this.getBaseDataPath())
    this.ensureDirectoryExists(this.getSettingsPath())
    this.ensureDirectoryExists(this.getDatabasePath())
    this.ensureDirectoryExists(this.getPluginsPath())
  }
}

export default DataPaths

import { BrowserWindow } from 'electron'

import ApiRepository from './ApiRepository'
import AppRepository from './AppRepository'
import DBRepository from './DBRepository'
import PluginsRepository from './PluginsRepository'
import SettingsRepository from './SettingsRepository'
import WallpaperRepository from './WallpaperRepository'
import AssetServer from 'electron-utils/AssetServer'

class Methods {
  public methods: any = {}
  private apiManager: any = null
  private pluginsRepository: any = null
  private eventManager: any = null

  constructor(
    private path: string,
    private runningPath: string,
    private win: BrowserWindow
  ) {}

  starUp = async () => {
    this.pluginsRepository = new PluginsRepository()
    await this.pluginsRepository.startUp()
    await this.refreshMethods()
  }

  // New method to refresh all methods including plugin methods
  refreshMethods = async () => {
    const apiRepository = new ApiRepository(this.pluginsRepository)
    const appRepository = new AppRepository(this.path, this.runningPath, this.win)
    const dbRepository = new DBRepository()
    await dbRepository.startup()
    const settingsRepository = new SettingsRepository()
    const wallpaperRepository = new WallpaperRepository()
    const assetServer = new AssetServer()

    this.methods = {
      ...apiRepository.methods,
      ...appRepository.methods,
      ...dbRepository.methods,
      ...this.pluginsRepository.methods,
      ...settingsRepository.methods,
      ...wallpaperRepository.methods,
      ...assetServer.methods,
      // Add method to refresh plugin handlers
      refreshPluginHandlers: async () => {
        await this.pluginsRepository.methods.installPlugins()
        await this.pluginsRepository.methods.activatePlugins()
        await this.refreshMethods()

        // Reset the event manager with new methods
        if (this.eventManager) {
          this.eventManager.updateMethods(this.methods)
        }

        return { success: true, message: 'Plugin handlers refreshed successfully' }
      }
    }
  }

  setEventManager = (eventManager: any) => {
    this.eventManager = eventManager
  }

  setApiManager = (apiManager: any) => {
    this.apiManager = apiManager
    // Update the restartApiServer method to use the actual ApiManager
    if (this.methods && this.methods.restartApiServer) {
      this.methods.restartApiServer = async () => {
        if (this.apiManager) {
          await this.apiManager.restartServer()
          return { message: 'API server restarted successfully' }
        }
        return { message: 'API manager not available' }
      }
    }
    // Update the getWebUIPort method to use the actual ApiManager
    if (this.methods && this.methods.getWebUIPort) {
      this.methods.getWebUIPort = async () => {
        if (this.apiManager) {
          const port = this.apiManager.getCurrentPort()
          return { port }
        }
        return { port: null }
      }
    }
  }
}

export default Methods

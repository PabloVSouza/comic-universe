import { BrowserWindow } from 'electron'
import AssetServer from 'electron-utils/AssetServer'
import ApiRepository from './ApiRepository'
import AppRepository from './AppRepository'
import DBRepository from './DBRepository'
import PluginsRepository from './PluginsRepository'
import SettingsRepository from './SettingsRepository'
import WallpaperRepository from './WallpaperRepository'
import WebsiteApiRepository from './WebsiteApiRepository'
import ApiManager from '../ApiManager'
import EventManager from '../EventManager'

class Methods {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public methods: Record<string, Function> = {}
  private apiManager: ApiManager | null = null
  private pluginsRepository: PluginsRepository | null = null
  private eventManager: EventManager | null = null

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

  refreshMethods = async () => {
    const apiRepository = new ApiRepository(this.pluginsRepository!)
    const appRepository = new AppRepository(this.path, this.runningPath, this.win)
    const dbRepository = new DBRepository()
    await dbRepository.startup()
    const settingsRepository = new SettingsRepository()
    const wallpaperRepository = new WallpaperRepository()
    const websiteApiRepository = new WebsiteApiRepository()
    const assetServer = new AssetServer()

    this.methods = {
      ...apiRepository.methods,
      ...appRepository.methods,
      ...dbRepository.methods,
      ...this.pluginsRepository!.methods,
      ...settingsRepository.methods,
      ...wallpaperRepository.methods,
      ...websiteApiRepository.methods,
      ...assetServer.methods,
      refreshPluginHandlers: async () => {
        await this.pluginsRepository!.methods.installPlugins()
        await this.pluginsRepository!.methods.activatePlugins()
        await this.refreshMethods()

        if (this.eventManager) {
          this.eventManager.updateMethods(this.methods)
        }

        return { success: true, message: 'Plugin handlers refreshed successfully' }
      }
    }
  }

  setEventManager = (eventManager: EventManager) => {
    this.eventManager = eventManager
  }

  setApiManager = (apiManager: ApiManager) => {
    this.apiManager = apiManager
    if (this.methods && this.methods.restartApiServer) {
      this.methods.restartApiServer = async () => {
        if (this.apiManager) {
          await this.apiManager.restartServer()
          return { message: 'API server restarted successfully' }
        }
        return { message: 'API manager not available' }
      }
    }
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

import { BrowserWindow } from 'electron'

import ApiRepository from './ApiRepository'
import AppRepository from './AppRepository'
import DBRepository from './DBRepository'
import PluginsRepository from './PluginsRepository'
import SettingsRepository from './SettingsRepository'

class Methods {
  public methods: any = {}
  private apiManager: any = null

  constructor(
    private path: string,
    private runningPath: string,
    private win: BrowserWindow
  ) {}

  starUp = async () => {
    const pluginsRepository = new PluginsRepository()
    await pluginsRepository.startUp()
    const apiRepository = new ApiRepository(pluginsRepository)
    const appRepository = new AppRepository(this.path, this.runningPath, this.win)
    const dbRepository = new DBRepository()
    await dbRepository.startup()
    const settingsRepository = new SettingsRepository()

    this.methods = {
      ...apiRepository.methods,
      ...appRepository.methods,
      ...dbRepository.methods,
      ...pluginsRepository.methods,
      ...settingsRepository.methods
    }
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

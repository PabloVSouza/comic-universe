import { BrowserWindow } from 'electron'

import ApiRepository from './ApiRepository'
import AppRepository from './AppRepository'
import DBRepository from './DBRepository'
import PluginsRepository from './PluginsRepository'

class Methods {
  public methods = {}
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
    const dbRepository = new DBRepository(this.path)

    this.methods = {
      ...apiRepository.methods,
      ...appRepository.methods,
      ...dbRepository.methods,
      ...pluginsRepository.methods
    }
  }
}

export default Methods

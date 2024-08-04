import { app } from 'electron'
import path from "path"
import { IRepoPluginRepository, IRepoPluginRepositoryConstruct } from '../../@types/RepoPlugin'

class RepoPluginsLoader {
  private pluginsPath = path.join(app.getPath('userData'), 'plugins')
  private pluginsFilePath = path.join(this.pluginsPath, 'plugins.js')

  public repoList = {} as IRepoPluginRepository[]

  public async GetPluginList() {
    try {
      const pluginList = (await import(this.pluginsFilePath)).default

      for (const plugin of pluginList) {

        const pluginPath = path.join(this.pluginsPath, plugin.path)

        const newPlugin:IRepoPluginRepositoryConstruct= (await import(pluginPath)).default.default

        const instantiatedPlugin = new newPlugin()

        this.repoList = {...this.repoList, [instantiatedPlugin.RepoTag]: {...instantiatedPlugin}}
      }

    }

    catch (e){
      throw e
    }
  }
}

export default RepoPluginsLoader

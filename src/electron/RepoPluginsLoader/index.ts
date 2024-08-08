import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import { IRepoPluginMethods, IRepoPluginRepositoryConstruct } from '../../@types/RepoPlugin'
import CreateDirectory from '../utils/CreateDirectory'

interface pluginListItem {
  name: string
  path: string
}
class RepoPluginsLoader {
  private pluginsProdPath = path.join(app.getPath('userData'), 'plugins')

  private pluginsDevPath = path.join('.', 'plugins')

  private pluginsFinalPath = is.dev ? this.pluginsDevPath : this.pluginsProdPath

  private pluginList = [] as pluginListItem[]

  constructor() {
    if (!this.verifyPluginFolderExists()) CreateDirectory(this.pluginsFinalPath)
    const pluginsFolderList = this.getPluginFolderList()
    this.pluginList = this.getPluginInfoList(pluginsFolderList)
  }

  private verifyPluginFolderExists = () => {
    return fs.existsSync(this.pluginsFinalPath)
  }

  private getPluginFolderList = () => {
    return fs.readdirSync(this.pluginsFinalPath).filter((val) => val !== '.DS_Store')
  }

  private getPluginInfoList = (folderList: string[]) => {
    const pluginsList = [] as { name: string; path: string }[]

    for (const folder of folderList) {
      const folderPath = path.join(this.pluginsFinalPath, folder)
      const packagePath = path.join(folderPath, 'package.json')

      if (fs.existsSync(packagePath)) {
        const packageFile = JSON.parse(String(fs.readFileSync(packagePath)))

        try {
          const repoObj = {
            name: packageFile.name,
            path: packageFile.main,
            version: packageFile.version,
            repository: packageFile.repository.url
          }

          pluginsList.push(repoObj)
        } catch {
          console.log(`Not a valid plugin: ${folder}`)
        }
      }
    }

    return pluginsList
  }

  public async getRepoList(): Promise<{
    [key: string]: { RepoName: string; RepoTag: string; methods: IRepoPluginMethods }
  }> {
    let repoList = {}

    try {
      for (const plugin of this.pluginList) {
        const partialPath = path.join(this.pluginsFinalPath, plugin.name, plugin.path)
        const pluginPath = is.dev ? path.join('..', '..', partialPath) : partialPath

        const { platform } = process

        const importPath = platform === 'win32' ? 'file://' + pluginPath : pluginPath

        const newPlugin: IRepoPluginRepositoryConstruct = (await import(importPath)).default.default

        const instantiatedPlugin = new newPlugin()

        repoList = {
          ...repoList,
          [instantiatedPlugin.RepoTag]: { ...instantiatedPlugin }
        }
      }

      return repoList
    } catch (e) {
      throw e
    }
  }
}

export default RepoPluginsLoader

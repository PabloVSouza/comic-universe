import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import CreateDirectory from 'utils/CreateDirectory'
import { extract } from 'pacote'
import githubApi from 'utils/GithubApi'
import ComicUniverseApi from 'utils/ComicUniverseApi'
import DownloadFile from 'utils/DownloadFile'

class PluginsRepository {
  private pluginsProdPath = path.join(app.getPath('userData'), 'plugins')

  public activePlugins = {} as { [key: string]: IRepoPluginRepository }

  private pluginsDevPath = './plugins'

  private pluginsFinalPath = is.dev ? this.pluginsDevPath : this.pluginsProdPath

  public startUp = async () => {
    if (!this.methods.verifyPluginFolderExists()) CreateDirectory(this.pluginsFinalPath)
    await this.methods.installPlugins()
    await this.methods.activatePlugins()
  }

  private getPluginFolderList = () =>
    fs
      .readdirSync(this.pluginsFinalPath, { withFileTypes: true })
      .filter((val) => val.name !== '.DS_Store' && val.isDirectory())
      .map((val) => val.name)

  private getNotInstalledPluginsList = () =>
    fs
      .readdirSync(this.pluginsFinalPath, { withFileTypes: true })
      .filter((val) => val.name.includes('.tgz') && !val.isDirectory())
      .map((val) => val.name)

  private getGithubData = async (repoUrl: string) => {
    const { data } = await githubApi.get(`repos/${repoUrl}/releases/latest`)
    return data
  }

  public methods = {
    verifyPluginFolderExists: () => {
      return fs.existsSync(this.pluginsFinalPath)
    },

    installPlugins: async () => {
      const pluginsList = this.getNotInstalledPluginsList()

      for (const plugin of pluginsList) {
        const { platform } = process

        const pluginPath = path.join(this.pluginsFinalPath, plugin)
        const devPath = is.dev ? './' + pluginPath : pluginPath
        const finalPath = platform === 'win32' ? 'file://' + devPath : devPath
        const destPath = path.join(
          this.pluginsFinalPath,
          plugin.substring(0, plugin.lastIndexOf('-'))
        )

        await extract(finalPath, destPath)

        fs.unlinkSync(devPath)
      }
    },

    activatePlugins: async () => {
      const pluginsList = this.methods.getPluginInfoList()

      try {
        for (const plugin of pluginsList) {
          const partialPath = path.join(this.pluginsFinalPath, plugin.name, plugin.path)
          const pluginPath = is.dev ? path.join('..', '..', partialPath) : partialPath

          const { platform } = process

          const importPath = platform === 'win32' ? 'file://' + pluginPath : pluginPath

          const newPlugin: IRepoPluginRepositoryConstruct = (await import(importPath)).default
            .default

          const instantiatedPlugin = new newPlugin()

          this.activePlugins = {
            ...this.activePlugins,
            [instantiatedPlugin.RepoTag]: instantiatedPlugin
          }
        }

        const win = BrowserWindow.getAllWindows()[0]
        if (!!win) win.webContents.send('updateRepos')
      } catch (e) {
        throw e
      }
    },

    updatePlugins: async () => {
      await this.methods.installPlugins()
      await this.methods.activatePlugins()
    },

    downloadAndInstallPlugin: async (plugin: string) => {
      const githubData = await this.getGithubData(plugin)
      await DownloadFile(this.pluginsFinalPath + '/', githubData.assets[0].browser_download_url)
    },

    getPluginsFromApi: async () => {
      const { data } = await ComicUniverseApi.get('plugins')

      return data
    },

    getPluginInfoList: () => {
      const folderList = this.getPluginFolderList()
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
              author: packageFile.author,
              version: packageFile.version,
              repository: packageFile.repository,
              iconPath: path.join(folderPath, packageFile.icon)
            } as IRepoPluginInfo

            pluginsList.push(repoObj)
          } catch {
            console.log(`Not a valid plugin: ${folder}`)
          }
        }
      }

      return pluginsList
    },

    getRepoList: async () => {
      return Object.values(this.activePlugins).map((plugin) => ({
        label: plugin.RepoName,
        value: plugin.RepoTag
      }))
    }
  }
}

export default PluginsRepository

import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import CreateDirectory from 'utils/CreateDirectory'
import { extract } from 'pacote'

class RepoPluginsLoader {
  private pluginsProdPath = path.join(app.getPath('userData'), 'plugins')

  public activePlugins = {} as { [key: string]: IRepoPluginRepository }

  private pluginsDevPath = './plugins'

  private pluginsFinalPath = is.dev ? this.pluginsDevPath : this.pluginsProdPath

  private verifyPluginFolderExists = () => {
    return fs.existsSync(this.pluginsFinalPath)
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

  public installPlugins = async () => {
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
  }

  private getPluginInfoList = () => {
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
            repository: packageFile.repository.url,
            iconPath: path.join(folderPath, packageFile.icon)
          } as IRepoPluginInfo

          pluginsList.push(repoObj)
        } catch {
          console.log(`Not a valid plugin: ${folder}`)
        }
      }
    }

    return pluginsList
  }

  public activatePlugins = async () => {
    const pluginsList = this.getPluginInfoList()

    try {
      for (const plugin of pluginsList) {
        const partialPath = path.join(this.pluginsFinalPath, plugin.name, plugin.path)
        const pluginPath = is.dev ? path.join('..', '..', partialPath) : partialPath

        const { platform } = process

        const importPath = platform === 'win32' ? 'file://' + pluginPath : pluginPath

        const newPlugin: IRepoPluginRepositoryConstruct = (await import(importPath)).default.default

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
  }

  public getRepoList = async () => {
    return Object.values(this.activePlugins).map((plugin) => ({
      label: plugin.RepoName,
      value: plugin.RepoTag
    }))
  }

  public downloadAndInstallPlugin = (plugin: string) => {
    console.log(plugin)
  }

  public updatePlugins = async () => {
    await this.installPlugins()
    await this.activatePlugins()
  }

  public startUp = async () => {
    if (!this.verifyPluginFolderExists()) CreateDirectory(this.pluginsFinalPath)
    await this.installPlugins()
    await this.activatePlugins()
  }
}

export default RepoPluginsLoader

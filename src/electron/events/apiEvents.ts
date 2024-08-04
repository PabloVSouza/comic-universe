import { ipcMain } from 'electron'
import RepoPluginLoader from '../RepoPluginsLoader'

const apiEvents = (): void => {
  const repoPlugin = new RepoPluginLoader()

  repoPlugin.GetPluginList().then(() => {
    const firstRepo = Object.getOwnPropertyNames(repoPlugin.repoList)[0]

    const properties = Object.getOwnPropertyNames(repoPlugin.repoList[firstRepo].methods)

    for (const method of properties) {
      ipcMain.handle(method, async (_event, { repo, data }) =>
        repoPlugin.repoList[repo].methods[method](data)
      )
    }
  })
}

export default apiEvents

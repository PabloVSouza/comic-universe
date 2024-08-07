import { ipcMain } from 'electron'
import RepoPluginLoader from '../RepoPluginsLoader'

const apiEvents = (): void => {
  const repoPlugin = new RepoPluginLoader()

  repoPlugin.getRepoList().then((repoList) => {
    if (Object.values(repoList).length > 0) {
      const firstRepo = Object.getOwnPropertyNames(repoList)[0]

      const properties = Object.getOwnPropertyNames(repoList[firstRepo].methods)

      for (const method of properties) {
        ipcMain.handle(method, async (_event, { repo, data }) =>
          repoList[repo].methods[method](data)
        )
      }
    }
  })
}

export default apiEvents

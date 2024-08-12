import { BrowserWindow, ipcMain } from 'electron'
import type { Startup } from 'scripts/Startup'

const apiEvents = (
  startupObject: Startup,
  _path: string,
  _runningPath: string,
  _win: BrowserWindow
): void => {
  const { repoPluginsObject } = startupObject

  const repoList = repoPluginsObject.activePlugins

  if (Object.values(repoList).length > 0) {
    const firstRepo = Object.getOwnPropertyNames(repoList)[0]
    const properties = Object.getOwnPropertyNames(repoList[firstRepo].methods)
    for (const method of properties) {
      ipcMain.handle(method, async (_event, { repo, data }) => repoList[repo].methods[method](data))
    }
  }
}

export default apiEvents

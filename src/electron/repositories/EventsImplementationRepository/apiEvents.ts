import { BrowserWindow, ipcMain } from 'electron'
import type { Startup } from 'scripts/Startup'
import ApiRepository from '../Methods/ApiRepository'

const apiEvents = (
  startupObject: Startup,
  _path: string,
  _runningPath: string,
  _win: BrowserWindow
): void => {
  const apiReposiitory = new ApiRepository(startupObject)
  const { methods, repoList } = apiReposiitory

  for (const method of methods) {
    ipcMain.handle(method, async (_event, { repo, data }) => repoList[repo].methods[method](data))
  }
}

export default apiEvents

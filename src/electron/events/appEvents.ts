import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import RepoPluginsLoader from '../RepoPluginsLoader'

const appEvents = (_win: BrowserWindow, path: string): void => {
  ipcMain.handle('getAppPath', () => path)
  ipcMain.handle('getIsDev', () => is.dev)
  ipcMain.handle('getAppRepos', async () => {
    const repoPlugin = new RepoPluginsLoader()
    await repoPlugin.GetPluginList()
    return Object.values(repoPlugin.repoList).map((val) => ({
      label: val.RepoName,
      value: val.RepoTag
    }))
  })
}

export default appEvents

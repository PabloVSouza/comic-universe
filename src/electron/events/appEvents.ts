import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import RepoPluginsLoader from '../RepoPluginsLoader'

const appEvents = (win: BrowserWindow, path: string): void => {
  ipcMain.handle('getAppPath', () => path)
  ipcMain.handle('getIsDev', () => is.dev)
  ipcMain.handle('maximizeWindow', () => {
    if (!win.isMaximized()) {
      win.maximize()
    } else {
      win.unmaximize()
    }
  })
  ipcMain.handle('closeWindow', () => {
    win.close()
  })
  ipcMain.handle('getAppRepos', async () => {
    const repoPlugin = new RepoPluginsLoader()
    const repoList = await repoPlugin.getRepoList()

    return Object.values(repoList).map((val) => ({
      label: val.RepoName,
      value: val.RepoTag
    }))
  })
}

export default appEvents

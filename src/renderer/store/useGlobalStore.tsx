import { create } from 'zustand'
import { SingleValue } from 'react-select'

const { invoke, on } = window.Electron.ipcRenderer

type TOption = SingleValue<{
  value: string
  label: string
}>

interface useGlobalStore {
  appPath: string
  appRunningPath: string
  menuVisible: boolean
  repoList: TOption[]
  pluginsList: IRepoPluginInfo[]
  toggleMenu: () => void
  getAppPath: () => Promise<void>
  getAppRunningPath: () => Promise<void>
  getRepoList: () => Promise<void>
  updatePlugins: () => Promise<void>
  getPluginInfoList: () => Promise<void>
  runMigrations: () => Promise<void>
  downloadAndInstallPlugin: (plugin: string) => Promise<void>
}

const useGlobalStore = create<useGlobalStore>((set) => ({
  appPath: '',
  appRunningPath: '',
  menuVisible: false,
  repoList: [],
  pluginsList: [],

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  getAppPath: async (): Promise<void> => {
    const appPath = await invoke('getAppPath')
    set((state) => ({ ...state, appPath }))
  },

  getAppRunningPath: async (): Promise<void> => {
    const appRunningPath = await invoke('getAppRunningPath')

    set((state) => ({ ...state, appRunningPath }))
  },

  getRepoList: async () => {
    const repoList = await invoke('getRepoList')

    set((state) => ({ ...state, repoList }))
  },

  updatePlugins: async () => {
    await invoke('installPlugins')
    await invoke('activatePlugins')
    await invoke('resetEvents')
  },

  getPluginInfoList: async () => {
    const pluginsList = await invoke('getPluginInfoList')

    set((state) => ({ ...state, pluginsList }))
  },

  downloadAndInstallPlugin: async (plugin) => {
    await invoke('downloadAndInstallPlugin', plugin)
  },

  runMigrations: async () => {
    await invoke('dbRunMigrations')
  }
}))

export default useGlobalStore

const { getAppPath, getRepoList, getAppRunningPath } = useGlobalStore.getState()

getAppPath()
getAppRunningPath()
getRepoList()

on('updateRepos', () => {
  getRepoList()
})

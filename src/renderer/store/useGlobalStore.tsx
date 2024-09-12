import { create } from 'zustand'
import { SingleValue } from 'react-select'
import useApi from 'api'

const { invoke, on } = useApi()

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
  activeComic: ComicInterface
  setActiveComic: (comic: ComicInterface) => void
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
  activeComic: {} as ComicInterface,

  setActiveComic: (activeComic) => set((state) => ({ ...state, activeComic })),

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
    const { updatePlugins, getPluginInfoList } = useGlobalStore.getState()
    await invoke('downloadAndInstallPlugin', plugin)
    await updatePlugins()
    await getPluginInfoList()
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

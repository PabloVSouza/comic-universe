import { create } from 'zustand'
import { SingleValue } from 'react-select'

const { invoke, on } = window.Electron.ipcRenderer

type TOption = SingleValue<{
  value: string
  label: string
}>

interface useGlobalStore {
  appPath: string
  menuVisible: boolean
  repoList: TOption[]
  toggleMenu: () => void
  getAppPath: () => Promise<void>
  getRepoList: () => Promise<void>
  updatePlugins: () => Promise<void>
}

const useGlobalStore = create<useGlobalStore>((set) => ({
  appPath: '',
  menuVisible: false,
  repoList: [],

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  getAppPath: async (): Promise<void> => {
    const appPath = await invoke('getAppPath')
    set((state) => ({ ...state, appPath }))
  },

  getRepoList: async () => {
    const repoList = await invoke('getRepoList')

    set((state) => ({ ...state, repoList }))
  },

  updatePlugins: async () => {
    await invoke('installPlugins')
    await invoke('activatePlugins')
    await invoke('resetEvents')
  }
}))

export default useGlobalStore

const { getAppPath, getRepoList } = useGlobalStore.getState()

getAppPath()
getRepoList()

on('updateRepos', () => {
  getRepoList()
})

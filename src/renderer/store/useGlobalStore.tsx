import { create } from 'zustand'
import { SingleValue } from 'react-select'

const { invoke } = window.Electron.ipcRenderer

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
  getAppRepos: () => Promise<void>
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

  getAppRepos: async () => {
    const repoList = await invoke('getAppRepos')
    set((state) => ({...state, repoList}))
  },
}))

export default useGlobalStore

const { getAppPath, getAppRepos } = useGlobalStore.getState()
getAppPath()
getAppRepos()

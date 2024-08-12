import { create } from 'zustand'

const { invoke } = window.Electron.ipcRenderer

interface useGlobalStore {
  appPath: string
  menuVisible: boolean
  toggleMenu: () => void
  getAppPath: () => Promise<void>
}

const useGlobalStore = create<useGlobalStore>((set) => ({
  appPath: '',
  menuVisible: false,

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  getAppPath: async (): Promise<void> => {
    const appPath = await invoke('getAppPath')
    set((state) => ({ ...state, appPath }))
  }
}))

export default useGlobalStore

const { getAppPath } = useGlobalStore.getState()
getAppPath()

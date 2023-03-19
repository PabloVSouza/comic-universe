import { create } from 'zustand'

const { invoke } = window.Electron.ipcRenderer

interface useGlobal {
  appPath: string
  menuVisible: boolean
  toggleMenu: () => void
  getAppPath: () => Promise<void>
}

const useGlobal = create<useGlobal>((set) => ({
  appPath: '',
  menuVisible: false,

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  getAppPath: async (): Promise<void> => {
    const appPath = await invoke('getAppPath')
    set((state) => ({ ...state, appPath }))
  }
}))

export default useGlobal

const { getAppPath } = useGlobal.getState()
getAppPath()

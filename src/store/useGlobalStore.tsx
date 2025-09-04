import { create } from 'zustand'
import useApi from 'api'

const { invoke } = useApi()

interface IAppParams {
  appRunningPath: string
  appPath: string
  isDev: boolean
}

interface IuseGlobalStore {
  appParams: IAppParams
  menuVisible: boolean
  activeComic: IComic
  queue: IChapter[]
  setQueue: (newQueue: (prevQueue: IChapter[]) => IChapter[]) => void
  getAppParams: () => Promise<void>
  toggleMenu: () => void
  setActiveComic: (comic: IComic) => void
  updatePlugins: () => Promise<void>
}

const useGlobalStore = create<IuseGlobalStore>((set) => ({
  appParams: {} as IAppParams,
  menuVisible: false,
  repoList: [],
  activeComic: {} as IComic,
  queue: [],

  setQueue: (newQueue) => {
    const { queue } = useGlobalStore.getState()
    set((state) => ({ ...state, queue: newQueue(queue) }))
  },

  getAppParams: async () => {
    const appParams = await invoke('getAppParams')
    set((state) => ({ ...state, appParams }))
  },

  setActiveComic: (activeComic) => set((state) => ({ ...state, activeComic })),

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  updatePlugins: async () => {
    await invoke('installPlugins')
    await invoke('activatePlugins')
    await invoke('resetEvents')
  }
}))

const { getAppParams } = useGlobalStore.getState()
getAppParams()

export default useGlobalStore

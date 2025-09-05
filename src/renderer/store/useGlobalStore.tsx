import { create } from 'zustand'

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
  getAppParams: (invoke: (method: string, args?: unknown) => Promise<unknown>) => Promise<void>
  toggleMenu: () => void
  setActiveComic: (comic: IComic) => void
  updatePlugins: (invoke: (method: string, args?: unknown) => Promise<unknown>) => Promise<void>
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

  getAppParams: async (invoke) => {
    const appParams = (await invoke('getAppParams')) as IAppParams
    set((state) => ({ ...state, appParams }))
  },

  setActiveComic: (activeComic) => set((state) => ({ ...state, activeComic })),

  toggleMenu: (): void => set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  updatePlugins: async (invoke) => {
    await invoke('installPlugins')
    await invoke('activatePlugins')
    await invoke('resetEvents')
  }
}))

export default useGlobalStore

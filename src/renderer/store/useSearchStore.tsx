import { create, StoreApi } from 'zustand'
import useDashboardStore from './useDashboardStore'
import usePersistStore from './usePersistStore'

const { invoke } = window.Electron.ipcRenderer

interface useSearchStore {
  comic: ComicInterface
  cacheList: ComicInterface[]
  list: ComicInterface[]
  chapters: ChapterInterface[]
  loading: boolean
  getList: () => Promise<void>
  search: (search: string) => Promise<void>
  getDetails: (input: { [key: string]: string }) => Promise<void>
  getChapters: (siteId: string) => Promise<void>
  insertComic: () => Promise<void>
  setComic: (data: ComicInterface) => void
  setLoading: (status: boolean) => void
  resetComic: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useSearchStore => ({
  comic: {} as ComicInterface,
  cacheList: [],
  chapters: [],
  list: [],
  loading: false,

  getList: async (): Promise<void> => {
    const { repo } = usePersistStore.getState()
    const { setLoading, cacheList } = useSearchStore.getState()
    setLoading(true)
    const list = await invoke('getList', { repo })
    const newCacheList = cacheList.length !== list.length ? list : cacheList

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, list, cacheList: newCacheList }))
      setLoading(false)
      resolve()
    })
  },

  search: async (search): Promise<void> => {
    const { repo } = usePersistStore.getState()
    const { setLoading, cacheList } = useSearchStore.getState()
    setLoading(true)
    const list = await invoke('search', { repo, data: { search } })
    const newCacheList = cacheList.length !== list.length ? list : cacheList

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, list, cacheList: newCacheList }))
      setLoading(false)

      resolve()
    })
  },

  getDetails: async (search): Promise<void> => {
    const { repo } = usePersistStore.getState()
    const { list } = useSearchStore.getState()
    const { siteId } = search

    const data = await invoke('getDetails', { repo, data: search })

    const index = list.findIndex((val) => val.siteId == siteId)

    list[index] = { ...list[index], ...data }

    set((state: useSearchStore) => ({ ...state, list }))

    return new Promise((resolve) => {
      resolve()
    })
  },

  getChapters: async (siteId): Promise<void> => {
    const { repo } = usePersistStore.getState()

    const chapters = await invoke('getChapters', { repo, data: { siteId } })

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, chapters }))
      resolve()
    })
  },

  insertComic: async (): Promise<void> => {
    const { repo } = usePersistStore.getState()
    const { comic, chapters } = useSearchStore.getState()

    await invoke('dbInsertComic', { comic, chapters, repo })

    const { getListDB } = useDashboardStore.getState()
    getListDB()
  },

  setLoading: (status) => set((state: useSearchStore) => ({ ...state, loading: status })),

  setComic: (comic) => set((state: useSearchStore) => ({ ...state, comic })),

  resetComic: () => set(() => ({ ...initialState(set) }))
})

const useSearchStore = create<useSearchStore>((set) => initialState(set))

export default useSearchStore

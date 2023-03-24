import { create, StoreApi } from 'zustand'
import useDashboard from './dashboard'

const { invoke } = window.Electron.ipcRenderer

interface useSearchStore {
  repo: string
  comic: Comic
  list: Comic[]
  chapters: Chapter[]
  getList: () => Promise<void>
  search: (search: string) => Promise<void>
  getDetails: (siteId: string) => Promise<void>
  getChapters: (siteId: string) => Promise<void>
  insertComic: () => Promise<void>
  setComic: (data: Comic) => void
  setRepo: (repo: string) => void
  resetComic: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useSearchStore => ({
  repo: 'hqnow',
  comic: {} as Comic,
  chapters: [],
  list: [],

  getList: async (): Promise<void> => {
    const { repo } = useSearchStore.getState()
    const list = await invoke('getList', { repo })

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, list }))
      resolve()
    })
  },

  search: async (search): Promise<void> => {
    const { repo } = useSearchStore.getState()
    const list = await invoke('search', { repo, data: { search } })

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, list }))
      resolve()
    })
  },

  getDetails: async (siteId): Promise<void> => {
    const { repo, list } = useSearchStore.getState()

    const data = await invoke('getDetails', { repo, data: { siteId } })

    const index = list.findIndex((val) => val.siteId == siteId)

    list[index] = { ...list[index], ...data }

    set((state: useSearchStore) => ({ ...state, list }))

    return new Promise((resolve) => {
      resolve()
    })
  },

  getChapters: async (siteId): Promise<void> => {
    const { repo } = useSearchStore.getState()

    const chapters = await invoke('getChapters', { repo, data: { siteId } })

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, chapters }))
      resolve()
    })
  },

  insertComic: async (): Promise<void> => {
    const { comic, chapters } = useSearchStore.getState()

    await invoke('dbInsertComic', { comic, chapters })

    const { getListDB } = useDashboard.getState()
    getListDB()
  },

  setComic: (comic) => set((state: useSearchStore) => ({ ...state, comic })),

  setRepo: (repo) => set((state: useSearchStore) => ({ ...state, repo })),

  resetComic: () => set((state: useSearchStore) => ({ ...initialState(set), list: state.list }))
})

const useSearchStore = create<useSearchStore>((set) => initialState(set))

const state = useSearchStore.getState()

state.getList()

export default useSearchStore

import { create, StoreApi } from 'zustand'
import merge from 'lodash.merge'

const { invoke } = window.Electron.ipcRenderer

interface useSearchStore {
  repo: string
  comic: Comic
  list: Comic[]
  chapters: Chapter[]
  getList: () => Promise<void>
  search: (search: string) => Promise<void>
  getDetails: (id: string) => Promise<void>
  getChapters: () => Promise<void>
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
    const list = await invoke('search', { repo, search })

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, list }))
      resolve()
    })
  },

  getDetails: async (id): Promise<void> => {
    const { repo, list } = useSearchStore.getState()

    const data = await invoke('getDetails', { repo, id })

    const index = list.findIndex((val) => val.id == id)

    list[index] = await merge(list[index], data)

    set((state: useSearchStore) => ({ ...state, list }))

    return new Promise((resolve) => {
      resolve()
    })
  },

  getChapters: async (): Promise<void> => {
    const { repo, comic } = useSearchStore.getState()

    const chapters = !comic.chapters
      ? await invoke('getChapters', { repo, id: comic.id })
      : comic.chapters

    return new Promise((resolve) => {
      set((state: useSearchStore) => ({ ...state, chapters }))
      resolve()
    })
  },

  setComic: (comic) => set((state: useSearchStore) => ({ ...state, comic })),
  setRepo: (repo) => set((state: useSearchStore) => ({ ...state, repo })),

  resetComic: () => set((state: useSearchStore) => ({ ...initialState(set), list: state.list }))
})

const useSearchStore = create<useSearchStore>((set) => initialState(set))

const state = useSearchStore.getState()

state.getList()

export default useSearchStore

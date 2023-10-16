import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer

interface useDashboardStore {
  comic: Comic
  chapters: Chapter[]
  list: Comic[]
  readProgress: ReadProgress[]
  getListDB: () => Promise<void>
  getChaptersDB: () => Promise<void>
  getReadProgressDB: () => Promise<void>
  setReadProgress: (chapter: Chapter, page: number) => Promise<void>
  setComic: (comic: Comic) => Promise<void>
}

const useDashboardStore = create<useDashboardStore>((set) => ({
  comic: {} as Comic,
  chapters: [],
  list: [],
  readProgress: [],

  getListDB: async (): Promise<void> => {
    const list = await invoke('dbGetAllComics')
    const { comic, setComic } = useDashboardStore.getState()
    set((state) => ({ ...state, list }))
    if (list.length && !comic.id) setComic(list[0])
  },

  getChaptersDB: async (): Promise<void> => {
    const { comic } = useDashboardStore.getState()
    const chapters = await invoke('dbGetChapters', {
      comicId: comic.id
    })

    set((state) => ({ ...state, chapters }))
  },

  getReadProgressDB: async (): Promise<void> => {
    const { comic } = useDashboardStore.getState()

    invoke('dbGetReadProgress', {
      comicId: comic.id
    }).then((res) => {
      set((state) => ({ ...state, readProgress: res }))
    })
  },

  setReadProgress: async (chapter, page): Promise<void> => {
    await invoke('dbUpdateReadProgress', {
      chapter,
      page
    })
  },

  setComic: async (comic): Promise<void> => {
    set((state) => ({ ...state, comic }))
    const { getReadProgressDB, getChaptersDB } = useDashboardStore.getState()
    await getChaptersDB()
    await getReadProgressDB()
  }
}))

const { getListDB } = useDashboardStore.getState()

getListDB()

export default useDashboardStore

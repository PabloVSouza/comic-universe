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
  changeReadProgress: (chapter: Chapter, page: number) => Promise<void>
  setComic: (comic: Comic) => void
}

const useDashboardStore = create<useDashboardStore>((set) => ({
  comic: {} as Comic,
  chapters: [],
  list: [],
  readProgress: [],

  getListDB: async (): Promise<void> => {
    const list = await invoke('dbGetAllComics')
    set((state) => ({ ...state, list }))
    set((state) => ({ ...state, activeComic: list[0] }))
  },

  getChaptersDB: async (): Promise<void> => {
    const { comic } = useDashboardStore.getState()
    const chapters = await invoke('dbGetChapters', {
      comicId: comic._id
    })

    set((state) => ({ ...state, chapters }))
  },

  getReadProgressDB: async (): Promise<void> => {
    const { comic } = useDashboardStore.getState()

    invoke('dbGetReadProgress', {
      comicId: comic._id
    }).then((res) => {
      set((state) => ({ ...state, readProgress: res }))
    })
  },

  changeReadProgress: async (chapter, page): Promise<void> => {
    await invoke('dbUpdateReadProgress', {
      comicId: chapter.comicId,
      chapter,
      page
    })
  },

  setComic: (comic): void => set((state) => ({ ...state, comic }))
}))

const { getListDB } = useDashboardStore.getState()
getListDB()

export default useDashboardStore

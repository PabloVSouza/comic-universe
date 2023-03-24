import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer

interface useDashboardStore {
  activeComic: Comic
  chapters: Chapter[]
  list: Comic[]
  readProgress: ReadProgress[]
  getListDB: () => Promise<void>
  getChaptersDB: () => Promise<void>
  getReadProgressDB: () => Promise<void>
  changeReadProgress: (chapter: Chapter, page: number) => Promise<void>
  setActiveComic: (comic: Comic) => void
}

const useDashboardStore = create<useDashboardStore>((set) => ({
  activeComic: {} as Comic,
  chapters: [],
  list: [],
  readProgress: [],

  getListDB: async (): Promise<void> => {
    const list = await invoke('dbGetAllComics')
    set((state) => ({ ...state, list }))
    set((state) => ({ ...state, activeComic: list[0] }))
  },

  getChaptersDB: async (): Promise<void> => {
    const { activeComic } = useDashboardStore.getState()
    const chapters = await invoke('dbGetChapters', {
      comicId: activeComic._id
    })

    set((state) => ({ ...state, chapters }))
  },

  getReadProgressDB: async (): Promise<void> => {
    const { activeComic } = useDashboardStore.getState()

    invoke('dbGetReadProgress', {
      comicId: activeComic._id
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

  setActiveComic: (comic): void => set((state) => ({ ...state, activeComic: comic }))
}))

const { getListDB } = useDashboardStore.getState()
getListDB()

export default useDashboardStore

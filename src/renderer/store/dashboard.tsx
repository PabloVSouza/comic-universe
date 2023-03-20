import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer

interface useDashboard {
  activeComic: Comic
  chapters: Chapter[]
  list: Comic[]
  readProgress: []
  getListDB: () => Promise<void>
  getChaptersDB: () => Promise<void>
  getReadProgressDB: () => Promise<void>
  changeReadProgress: (chapter: Chapter, page: string) => Promise<void>
  setActiveComic: (comic: Comic) => void
}

const useDashboard = create<useDashboard>((set) => ({
  activeComic: {} as Comic,
  chapters: [],
  list: [],
  readProgress: [],

  getListDB: async (): Promise<void> => {
    const list = await invoke('getListDB')
    set((state) => ({ ...state, list }))
    set((state) => ({ ...state, activeComic: list[0] }))
  },

  getChaptersDB: async (): Promise<void> => {
    const { activeComic } = useDashboard.getState()
    const chapters = await invoke('getChaptersDB', {
      comicId: activeComic._id
    })

    set((state) => ({ ...state, chapters }))
  },

  getReadProgressDB: async (): Promise<void> => {
    const { activeComic } = useDashboard.getState()

    invoke('getReadProgressDB', {
      comicId: activeComic._id
    }).then((res) => {
      set((state) => ({ ...state, readProgress: res }))
    })
  },

  changeReadProgress: async (chapter, page): Promise<void> => {
    await invoke('changePageDB', {
      comicId: chapter.comicId,
      chapter,
      page
    })
  },

  setActiveComic: (comic): void => set((state) => ({ ...state, activeComic: comic }))
}))

const { getListDB } = useDashboard.getState()
getListDB()

export default useDashboard

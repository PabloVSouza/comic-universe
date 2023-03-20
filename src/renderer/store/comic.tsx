import { create, StoreApi } from 'zustand'
import merge from 'lodash.merge'

const { invoke } = window.Electron.ipcRenderer

interface useComic {
  type: string
  comic: Comic
  queue: Chapter[]
  chapters: Chapter[]
  downloadedChapters: Chapter[]
  list: Comic[]
  selectedComic: Comic
  getComicData: (id: string) => Promise<void>
  getList: () => Promise<void>
  getDetails: (id: string) => Promise<void>
  getChapters: () => Promise<void>
  downloadChapter: (chapter: Chapter) => Promise<void>
  setComic: (data: Comic) => void
  setQueue: (data: Chapter[]) => void
  setType: (type: string) => void
  resetComic: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useComic => ({
  type: 'hq',
  comic: {} as Comic,
  queue: [],
  chapters: [],
  downloadedChapters: [],
  list: [],
  selectedComic: {} as Comic,

  getComicData: async (id): Promise<void> => {
    const data = {} as useComic
    const inDatabase = await invoke('getComicDB', { id: String(id) })

    if (inDatabase) {
      data.comic = inDatabase

      const downloadedChapters = await invoke('getChaptersDB', {
        comicId: inDatabase._id
      })

      if (downloadedChapters) data.downloadedChapters = downloadedChapters
    }

    const state = useComicData.getState()

    if (!inDatabase) {
      if (state.list.length === 0) await state.getList()

      const comic = state.list.find((val) => val.id == id) as Comic

      if (!comic.synopsis || !comic.cover) await state.getDetails(id)

      data.comic = comic
    }

    set((state: useComic) => ({ ...state, ...data }))
    await state.getChapters()

    return new Promise((resolve) => {
      resolve()
    })
  },

  getList: async (): Promise<void> => {
    const { type } = useComicData.getState()
    const list = await invoke('getList', { type })

    return new Promise((resolve) => {
      set((state: useComic) => ({ ...state, list }))
      resolve()
    })
  },

  getDetails: async (id): Promise<void> => {
    const { list, type } = useComicData.getState()

    const data = await invoke('getDetails', { type, id })

    const index = list.findIndex((val) => val.id == id)

    list[index] = await merge(list[index], data)

    set((state: useComic) => ({ ...state, list }))

    return new Promise((resolve) => {
      resolve()
    })
  },

  getChapters: async (): Promise<void> => {
    const { type } = useComicData.getState()

    const { comic } = useComicData.getState()

    const chapters = !comic.chapters
      ? await invoke('getChapters', { type, id: comic.id })
      : comic.chapters

    return new Promise((resolve) => {
      set((state: useComic) => ({ ...state, chapters }))
      resolve()
    })
  },

  downloadChapter: async (chapter): Promise<void> => {
    const { comic, type, getComicData } = useComicData.getState()

    if (!chapter.pages) {
      await invoke('getPages', { type, comic, chapter })
    }

    comic.type = type

    const downloadData = {
      type,
      comic,
      chapter
    }

    const chapterFiles = await invoke('downloadChapter', downloadData)

    comic.cover = chapterFiles.cover

    chapter.pages = chapterFiles.pageFiles

    delete comic.chapters

    await invoke('createComicDB', { comic, chapter })

    await getComicData(comic.id)

    return new Promise((resolve) => {
      resolve()
    })
  },

  setComic: (data) => set((state: useComic) => ({ ...state, selectedComic: data })),
  setQueue: (data) => set((state: useComic) => ({ ...state, queue: data })),
  setType: (type) => set((state: useComic) => ({ ...state, type })),

  resetComic: () => set((state: useComic) => ({ ...initialState(set), list: state.list }))
})

const useComicData = create<useComic>((set) => initialState(set))

const state = useComicData.getState()

state.getList()

export default useComicData

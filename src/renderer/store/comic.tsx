import { create, StoreApi } from 'zustand'
import merge from 'lodash.merge'

const { invoke } = window.Electron.ipcRenderer

interface useComic {
  repo: string
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
  setRepo: (repo: string) => void
  resetComic: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useComic => ({
  repo: 'hq',
  comic: {} as Comic,
  queue: [],
  chapters: [],
  downloadedChapters: [],
  list: [],
  selectedComic: {} as Comic,

  getComicData: async (id): Promise<void> => {
    const data = {} as useComic
    const inDatabase = await invoke('dbGetComic', { id: String(id) })

    if (inDatabase) {
      data.comic = inDatabase

      const downloadedChapters = await invoke('dbGetChapters', {
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
    const { repo } = useComicData.getState()
    const list = await invoke('getList', { repo: 'hqnow' })

    return new Promise((resolve) => {
      set((state: useComic) => ({ ...state, list }))
      resolve()
    })
  },

  getDetails: async (id): Promise<void> => {
    const { list, repo } = useComicData.getState()

    const data = await invoke('getDetails', { repo, id })

    const index = list.findIndex((val) => val.id == id)

    list[index] = await merge(list[index], data)

    set((state: useComic) => ({ ...state, list }))

    return new Promise((resolve) => {
      resolve()
    })
  },

  getChapters: async (): Promise<void> => {
    const { repo } = useComicData.getState()

    const { comic } = useComicData.getState()

    const chapters = !comic.chapters
      ? await invoke('getChapters', { repo, id: comic.id })
      : comic.chapters

    return new Promise((resolve) => {
      set((state: useComic) => ({ ...state, chapters }))
      resolve()
    })
  },

  downloadChapter: async (chapter): Promise<void> => {
    const { comic, repo, getComicData } = useComicData.getState()

    if (!chapter.pages) {
      await invoke('getPages', { repo, comic, chapter })
    }

    comic.repo = repo

    const chapterFiles = await invoke('downloadChapter', { repo, comic, chapter })

    comic.cover = chapterFiles.cover

    chapter.pages = chapterFiles.pageFiles

    delete comic.chapters

    await invoke('dbInsertComic', { comic, chapter })

    await getComicData(comic.id)

    return new Promise((resolve) => {
      resolve()
    })
  },

  setComic: (data) => set((state: useComic) => ({ ...state, selectedComic: data })),
  setQueue: (data) => set((state: useComic) => ({ ...state, queue: data })),
  setRepo: (repo) => set((state: useComic) => ({ ...state, repo })),

  resetComic: () => set((state: useComic) => ({ ...initialState(set), list: state.list }))
})

const useComicData = create<useComic>((set) => initialState(set))

const state = useComicData.getState()

state.getList()

export default useComicData

import { create } from 'zustand'
import useApi from 'api'
import useDownloadStore from './useDownloadStore'

interface useDashboardStore {
  comic: ComicInterface
  list: ComicInterface[]
  getListDB: () => Promise<void>
  setComic: (comic: ComicInterface) => Promise<void>
  deleteComic: (comic: ComicInterface) => Promise<void>
}

const { invoke } = useApi()

const useDashboardStore = create<useDashboardStore>((set) => ({
  comic: {} as ComicInterface,
  list: [],
  readProgress: [],

  getListDB: async (): Promise<void> => {
    const list = await invoke('dbGetAllComics')
    const chapters = await invoke('dbGetAllChaptersNoPage')

    const { addToQueue } = useDownloadStore.getState()

    for (const chapter of chapters) {
      chapter.pages ? null : addToQueue(chapter)
    }

    set((state) => ({ ...state, list }))
  },

  setComic: async (comic): Promise<void> => {
    set((state) => ({ ...state, comic }))
  },

  deleteComic: async (comic): Promise<void> => {
    const { getListDB } = useDashboardStore.getState()
    await invoke('dbDeleteComic', { comic })
    getListDB()
  }
}))

export default useDashboardStore

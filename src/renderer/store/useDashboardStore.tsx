import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer
import useDownloadStore from './useDownloadStore'

interface useDashboardStore {
  comic: ComicInterface
  list: ComicInterface[]
  getListDB: () => Promise<void>
  setComic: (comic: ComicInterface) => Promise<void>
}

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

    const { comic, setComic } = useDashboardStore.getState()
    set((state) => ({ ...state, list }))
    if (list.length && !comic.id) setComic(list[0])
  },

  setComic: async (comic): Promise<void> => {
    const completeComic = await invoke('dbGetComicComplete', { id: comic.id })
    set((state) => ({ ...state, comic: completeComic }))
  }
}))

const { getListDB } = useDashboardStore.getState()

getListDB()

export default useDashboardStore

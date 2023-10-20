import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer
import useDownloadStore from './useDownloadStore'

interface useDashboardStore {
  comic: ComicInterface
  list: ComicInterface[]
  readProgress: ReadProgressInterface[]
  getListDB: () => Promise<void>
  getReadProgressDB: () => Promise<void>
  setReadProgress: (chapter: ChapterInterface, page: number) => Promise<void>
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
    const { getReadProgressDB } = useDashboardStore.getState()
    await getReadProgressDB()
  }
}))

const { getListDB } = useDashboardStore.getState()

getListDB()

export default useDashboardStore

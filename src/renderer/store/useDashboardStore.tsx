import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer
import useDownloadStore from './useDownloadStore'
import usePersistStore from './usePersistStore'

interface useDashboardStore {
  comic: ComicInterface
  list: ComicInterface[]
  getListDB: () => Promise<void>
  setComic: (id: number) => Promise<void>
  getNewChapters: () => Promise<void>
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

    set((state) => ({ ...state, list }))
  },

  setComic: async (id): Promise<void> => {
    const { currentUser } = usePersistStore.getState()
    if (currentUser.id) {
      const userId = currentUser.id
      const completeComic = await invoke('dbGetComicComplete', { id, userId })
      set((state) => ({ ...state, comic: completeComic }))
    }
  },

  getNewChapters: async (): Promise<void> => {
    const { comic, getListDB } = useDashboardStore.getState()

    const { repo, siteId } = comic
    const chapters = await invoke('getChapters', { repo, data: { siteId } })
    const newChapters = chapters.reduce((acc, cur) => {
      return comic.chapters.findIndex((val) => val.siteId === cur.siteId)
        ? [...acc, { ...cur, comicId: comic.id, repo: comic.repo }]
        : [...acc]
    }, [])

    await invoke('dbInsertChapters', { chapters: newChapters })

    await getListDB()

    return new Promise((resolve) => resolve())
  }
}))

const { getListDB } = useDashboardStore.getState()

getListDB()

export default useDashboardStore

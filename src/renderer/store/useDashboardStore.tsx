import { create } from 'zustand'

interface useDashboardStore {
  comic: ComicInterface

  setComic: (comic: ComicInterface) => Promise<void>
}

const useDashboardStore = create<useDashboardStore>((set) => ({
  comic: {} as ComicInterface,

  // getListDB: async (): Promise<void> => {
  //   const list = await invoke('dbGetAllComics')
  //   const chapters = await invoke('dbGetAllChaptersNoPage')

  //   const { addToQueue } = useDownloadStore.getState()

  //   for (const chapter of chapters) {
  //     chapter.pages ? null : addToQueue(chapter)
  //   }

  //   set((state) => ({ ...state, list }))
  // },

  setComic: async (comic): Promise<void> => {
    set((state) => ({ ...state, comic }))
  }
}))

export default useDashboardStore

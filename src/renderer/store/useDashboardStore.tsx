import { create } from 'zustand'

interface useDashboardStore {
  comic: ComicInterface

  setComic: (comic: ComicInterface) => Promise<void>
}

const useDashboardStore = create<useDashboardStore>((set) => ({
  comic: {} as ComicInterface,

  setComic: async (comic): Promise<void> => {
    set((state) => ({ ...state, comic }))
  }
}))

export default useDashboardStore

import { create } from 'zustand'

interface IDashboardStore {
  comic: IComic

  setComic: (comic: IComic) => Promise<void>
}

const useDashboardStore = create<IDashboardStore>((set) => ({
  comic: {} as IComic,

  setComic: async (comic): Promise<void> => {
    set((state) => ({ ...state, comic }))
  }
}))

export default useDashboardStore

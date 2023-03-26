import { create, StoreApi } from 'zustand'

interface useReaderStore {
  page: number
  setPage: (page: number) => void
  resetReader: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useReaderStore => ({
  page: 0,

  setPage: (page): void => set((state: useReaderStore) => ({ ...state, page })),

  resetReader: () => set(() => ({ ...initialState(set) }))
})

const useReaderStore = create<useReaderStore>((set) => initialState(set))

export default useReaderStore

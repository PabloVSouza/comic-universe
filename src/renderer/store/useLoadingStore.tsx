import { create } from 'zustand'
import useApi from 'api'

interface useLoadingStore {
  status: boolean
  message: string
  type: string
  target: string
  progress: {
    current: number
    total: number
  }
  setLoading: (data: useLoadingStore) => void
}

const useLoadingStore = create<useLoadingStore>((set) => ({
  status: false,
  message: '',
  type: '',
  target: '',
  progress: {
    current: 0,
    total: 0
  },

  setLoading: (data): void => set((state) => ({ ...state, ...data }))
}))

export default useLoadingStore

const { on } = useApi()

on('loading', (_event, data) => {
  useLoadingStore.getState().setLoading(data)
})

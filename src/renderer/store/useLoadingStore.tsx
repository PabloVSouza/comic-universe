import { create } from 'zustand'

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

const { on } = window.Electron.ipcRenderer

on('loading', (_event, data) => {
  useLoadingStore.getState().setLoading(data)
})

import { create } from 'zustand'

interface useLoading {
  status: boolean
  message: string
  type: string
  target: string
  progress: {
    current: number
    total: number
  }
  setLoading: (data: useLoading) => void
}

const useLoading = create<useLoading>((set) => ({
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

export default useLoading

const { on } = window.Electron.ipcRenderer

on('loading', (event, data) => {
  useLoading.getState().setLoading(data)
})

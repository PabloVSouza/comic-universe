import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// const { invoke } = window.Electron.ipcRenderer

interface useDownloadStore {
  queue: ChapterInterface[]
  addToQueue: (chapter: ChapterInterface) => Promise<void>
  removeFromQueue: (chapter: ChapterInterface) => Promise<void>
  downloadChapter: (chapter: ChapterInterface) => Promise<void>
}

const useDownloadStore = create<useDownloadStore>()(
  persist(
    (set, get) => ({
      queue: [],

      addToQueue: async (chapter): Promise<void> => {
        set({ queue: [...get().queue, chapter] })
      },

      removeFromQueue: async (chapter): Promise<void> => {
        set({ queue: get().queue.filter((item) => item.id !== chapter.id) })
      },

      downloadChapter: async (): Promise<void> => {
        return
      }
    }),
    {
      name: 'download-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useDownloadStore

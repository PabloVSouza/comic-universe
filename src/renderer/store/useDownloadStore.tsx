import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import usePersistStore from './usePersistStore'

const { invoke } = window.Electron.ipcRenderer

interface useDownloadStore {
  queue: ChapterInterface[]
  addToQueue: (chapter: ChapterInterface) => Promise<void>
  removeFromQueue: (chapter: ChapterInterface) => Promise<void>
  getChapterPages: (chapter: ChapterInterface) => Promise<void>
  downloadChapter: (chapter: ChapterInterface) => Promise<void>
}

const useDownloadStore = create<useDownloadStore>()(
  persist(
    (set, get) => ({
      queue: [],

      addToQueue: async (chapter): Promise<void> => {
        const { queue } = useDownloadStore.getState()
        if (!queue.find((item) => item.id === chapter.id)) set({ queue: [...get().queue, chapter] })
      },

      removeFromQueue: async (chapter): Promise<void> => {
        set({ queue: get().queue.filter((item) => item.id !== chapter.id) })
      },

      getChapterPages: async (chapter): Promise<void> => {
        const { repo } = usePersistStore.getState()

        const { removeFromQueue } = useDownloadStore.getState()

        const { siteLink } = chapter

        console.log(`Getting Chapter ${chapter.number} on Link ${chapter.siteLink}`)

        const pages = JSON.stringify(await invoke('getPages', { repo, data: { siteLink } }))

        await invoke('dbUpdateChapter', { chapter: { ...chapter, pages } })

        await removeFromQueue(chapter)

        return
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

const queueManager = (): void => {
  let isCleaning = false

  const queueCleaner = async (): Promise<void> => {
    if (!isCleaning) {
      const { queue, getChapterPages } = useDownloadStore.getState()
      if (queue.length > 0) {
        isCleaning = true
        console.log('Cleaning Queue')
        for (const item of queue) {
          await getChapterPages(item)
        }
        isCleaning = false
        console.log('Queue Cleaned!')
        return new Promise((resolve) => resolve())
      }
    }
  }

  setInterval(
    async () => {
      await queueCleaner()
    },
    2000,
    []
  )
}

queueManager()

export default useDownloadStore

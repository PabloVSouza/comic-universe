import { create } from 'zustand'
const { invoke } = window.Electron.ipcRenderer

interface useDownloadStore {
  queue: ChapterInterface[]
  addToQueue: (chapter: ChapterInterface) => Promise<void>
  removeFromQueue: (chapter: ChapterInterface) => Promise<void>
  getChapterPages: (chapter: ChapterInterface) => Promise<void>
  downloadChapter: (chapter: ChapterInterface) => Promise<void>
}

const useDownloadStore = create<useDownloadStore>((set) => ({
  queue: [],

  addToQueue: async (chapter): Promise<void> => {
    const { queue } = useDownloadStore.getState()
    if (!queue.find((item) => item.id === chapter.id))
      set((state: useDownloadStore) => ({ queue: [...state.queue, chapter] }))
  },

  removeFromQueue: async (chapter): Promise<void> => {
    set((state: useDownloadStore) => ({
      queue: state.queue.filter((item) => item.id !== chapter.id)
    }))
  },

  getChapterPages: async (chapter): Promise<void> => {
    const { removeFromQueue, getChapterPages } = useDownloadStore.getState()

    const { siteLink } = chapter

    const { repo } = chapter

    const pages = JSON.stringify(await invoke('getPages', { repo, data: { siteLink } }))

    if (pages.length === 0) {
      console.log('Trying again the chapter ' + chapter.number)
      await getChapterPages(chapter)
    } else {
      await invoke('dbUpdateChapter', { chapter: { ...chapter, pages } })

      await removeFromQueue(chapter)
    }

    return
  },

  downloadChapter: async (): Promise<void> => {
    return
  }
}))

const queueManager = (): void => {
  let isCleaning = false

  const queueCleaner = async (): Promise<void> => {
    if (!isCleaning) {
      const { queue, getChapterPages } = useDownloadStore.getState()
      if (queue.length > 0) {
        isCleaning = true
        console.log('Cleaning Queue')
        for (const item of queue) {
          getChapterPages(item)
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

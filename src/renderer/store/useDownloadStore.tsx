import { create } from 'zustand'
import useDashboardStore from './useDashboardStore'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import useLang from 'lang'

const { invoke } = window.Electron.ipcRenderer

interface useDownloadStore {
  queue: ChapterInterface[]
  addToQueue: (chapter: ChapterInterface) => Promise<void>
  removeFromQueue: (chapter: ChapterInterface) => Promise<void>
  getChapterPages: (chapter: ChapterInterface) => Promise<boolean>
  downloadChapter: (chapter: ChapterInterface) => Promise<void>
  getNewChapters: () => Promise<void>
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

  getNewChapters: async (): Promise<void> => {
    const { comic, getListDB } = useDashboardStore.getState()

    const { repo, siteId } = comic
    const chapters = await invoke('getChapters', { repo, data: { siteId } })

    const newChapters = chapters
      .filter((val) => comic.chapters.findIndex((chapter) => val.siteId === chapter.siteId) < 0)
      .reduce((acc, cur) => {
        return [...acc, { ...cur, comicId: comic.id, repo: comic.repo }]
      }, [])

    if (newChapters.length) {
      await invoke('dbInsertChapters', { chapters: newChapters })

      await getListDB()
    } else {
      const lang = useLang()
      confirmAlert({
        message: lang.Dashboard.newChapter.noNewChapterMessage,
        buttons: [
          {
            label: lang.Dashboard.newChapter.noNewChapterConfirm
          }
        ]
      })
    }

    return new Promise((resolve) => resolve())
  },

  getChapterPages: async (chapter): Promise<boolean> => {
    const { repo } = chapter

    const pages = await invoke('getPages', { repo, data: { chapter } })

    if (pages.length > 0) {
      await invoke('dbUpdateChapter', { chapter: { ...chapter, pages: JSON.stringify(pages) } })
    }

    return !!pages.length
  },

  downloadChapter: async (): Promise<void> => {
    return
  }
}))

const queueManager = (): void => {
  let inProgress = [] as ChapterInterface[]

  const queueCleaner = async (): Promise<void> => {
    const { queue, getChapterPages, removeFromQueue } = useDownloadStore.getState()
    const { getListDB, setComic } = useDashboardStore.getState()

    const notInProgress = queue.filter((e) => !inProgress.includes(e))

    inProgress = [...inProgress, ...notInProgress]

    if (inProgress.length) {
      for (const chapter of notInProgress) {
        getChapterPages(chapter).then(async (result) => {
          inProgress = inProgress.filter((e) => e.id !== chapter.id)
          if (result) {
            await removeFromQueue(chapter).then(() => {
              setComic(chapter.comicId)
            })
          }
        })
      }

      getListDB()
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

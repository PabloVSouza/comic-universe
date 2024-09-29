import { create } from 'zustand'
import useGlobalStore from './useGlobalStore'
import useLang from 'lang'
import useApi from 'api'
import { confirmAlert } from 'components/Alert'
import usePersistStore from './usePersistStore'

const { invoke } = useApi()

interface useDownloadStore {
  queue: IChapter[]
  addToQueue: (chapter: IChapter) => Promise<void>
  removeFromQueue: (chapter: IChapter) => Promise<void>
  getChapterPages: (chapter: IChapter) => Promise<boolean>
  downloadChapter: (chapter: IChapter) => Promise<void>
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
    const { activeComic } = useGlobalStore.getState()
    const { currentUser } = usePersistStore.getState()

    const { repo, siteId } = activeComic
    const { chapters: currentChapters } = await invoke('dbGetComicAdditionalData', {
      id: activeComic.id,
      userId: currentUser.id
    })

    const chapters = await invoke('getChapters', { repo, data: { siteId } })

    const newChapters = chapters
      .filter((val) => currentChapters.findIndex((chapter) => val.siteId === chapter.siteId) < 0)
      .reduce((acc, cur) => {
        return [...acc, { ...cur, comicId: activeComic.id, repo: activeComic.repo }]
      }, [])

    if (newChapters.length) {
      await invoke('dbInsertChapters', { chapters: newChapters })
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
  let inProgress = [] as IChapter[]

  const queueCleaner = async (): Promise<void> => {
    const { queue, getChapterPages, removeFromQueue } = useDownloadStore.getState()
    const { setActiveComic, activeComic } = useGlobalStore.getState()

    const notInProgress = queue.filter((e) => !inProgress.includes(e))

    inProgress = [...inProgress, ...notInProgress]

    if (inProgress.length) {
      for (const chapter of notInProgress) {
        getChapterPages(chapter).then(async (result) => {
          inProgress = inProgress.filter((e) => e.id !== chapter.id)
          if (result) {
            await removeFromQueue(chapter).then(() => {
              setActiveComic(activeComic)
            })
          }
        })
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

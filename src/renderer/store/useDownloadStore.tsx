import { create } from 'zustand'
import useGlobalStore from './useGlobalStore'
import { confirmAlert } from 'components/Alert'
import usePersistSessionStore from 'store/usePersistSessionStore'

interface useDownloadStore {
  queue: IChapter[]
  addToQueue: (chapter: IChapter) => Promise<void>
  removeFromQueue: (chapter: IChapter) => Promise<void>
  getChapterPages: (
    chapter: IChapter,
    invoke: (method: string, args?: unknown) => Promise<unknown>
  ) => Promise<boolean>
  downloadChapter: () => Promise<void>
  getNewChapters: (invoke: (method: string, args?: unknown) => Promise<unknown>) => Promise<void>
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

  getNewChapters: async (invoke): Promise<void> => {
    const { activeComic } = useGlobalStore.getState()
    const { currentUser } = usePersistSessionStore.getState()

    const { repo, siteId } = activeComic
    const { chapters: currentChapters } = (await invoke('dbGetComicAdditionalData', {
      id: activeComic.id,
      userId: currentUser.id
    })) as { chapters: IChapter[] }

    const chapters = (await invoke('getChapters', { repo, data: { siteId } })) as IChapter[]

    const newChapters = chapters
      .filter((val) => currentChapters.findIndex((chapter) => val.siteId === chapter.siteId) < 0)
      .reduce((acc, cur) => {
        return [...acc, { ...cur, comicId: activeComic.id, repo: activeComic.repo }]
      }, [] as IChapter[])

    if (newChapters.length) {
      await invoke('dbInsertChapters', { chapters: newChapters })
    } else {
      confirmAlert({
        message: 'No new chapters found',
        buttons: [
          {
            label: 'OK'
          }
        ]
      })
    }

    return new Promise((resolve) => resolve())
  },

  getChapterPages: async (chapter, invoke): Promise<boolean> => {
    const { repo } = chapter

    const pages = (await invoke('getPages', { repo, data: { chapter } })) as IPage[]

    if (pages.length > 0) {
      await invoke('dbUpdateChapter', { chapter: { ...chapter, pages: JSON.stringify(pages) } })
    }

    return !!pages.length
  },

  downloadChapter: async (): Promise<void> => {
    return
  }
}))

export default useDownloadStore

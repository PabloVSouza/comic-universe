import { create, StoreApi } from 'zustand'

const { invoke } = window.Electron.ipcRenderer

interface useReaderStore {
  chapters: ChapterInterface[]
  readProgress: ReadProgressInterface
  page: number
  getChaptersDB: (comicId: number) => Promise<void>
  getReadProgressDB: (chapterId: number) => Promise<void>
  setInitialState: (comicId: number, chapterId: number) => Promise<void>
  setReadProgressDB: (chapter: ChapterInterface, page: number) => Promise<void>
  setPage: (page: number) => void
  resetReader: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useReaderStore => ({
  chapters: [],
  readProgress: {} as ReadProgressInterface,
  page: 0,

  setInitialState: async (comicId, chapterId): Promise<void> => {
    const { getChaptersDB, getReadProgressDB } = useReaderStore.getState()

    await getChaptersDB(comicId)
    await getReadProgressDB(chapterId)

    const { readProgress, setPage } = useReaderStore.getState()

    readProgress.page !== 0 ? setPage(readProgress.page) : setPage(0)
    return new Promise((resolve) => resolve())
  },

  getChaptersDB: async (comicId): Promise<void> => {
    const chapters = await invoke('dbGetChapters', {
      comicId
    })

    set((state: useReaderStore) => ({ ...state, chapters }))

    return new Promise((resolve) => resolve())
  },

  getReadProgressDB: async (chapterId): Promise<void> => {
    let readProgress = await invoke('dbGetReadProgress', {
      chapterId
    })

    if (!readProgress.length) {
      const { chapters, setReadProgressDB } = useReaderStore.getState()
      const chapter = chapters.find((chapter) => chapter.id === chapterId)
      if (chapter) {
        await setReadProgressDB(chapter, 0)

        readProgress = await invoke('dbGetReadProgress', {
          chapterId
        })
      }
    }

    set((state: useReaderStore) => ({ ...state, readProgress: readProgress[0] }))

    return new Promise((resolve) => resolve())
  },

  setReadProgressDB: async (chapter, page): Promise<void> => {
    await invoke('dbUpdateReadProgress', {
      chapter,
      page
    })
  },

  setPage: (page): void => {
    set((state: useReaderStore) => ({ ...state, page }))
  },

  resetReader: (): void => set(() => initialState(set))
})

const useReaderStore = create<useReaderStore>((set) => initialState(set))

export default useReaderStore

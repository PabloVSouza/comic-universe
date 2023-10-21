import { create, StoreApi } from 'zustand'
import useDashboardStore from './useDashboardStore'
import usePersistStore from './usePersistStore'

const { invoke } = window.Electron.ipcRenderer

interface useReaderStore {
  readProgress: ReadProgressInterface
  chapterIndex: number
  setInitialState: (comicId: number, chapterId: number) => Promise<void>
  setChapterIndex: (chapterIndex: number) => Promise<void>
  setReadProgress: (readProgress: ReadProgressInterface) => Promise<void>
  setReadProgressDB: (readProgress: ReadProgressInterface) => Promise<void>
  resetReader: () => void
}

const initialState = (set: StoreApi<unknown>['setState']): useReaderStore => ({
  readProgress: {} as ReadProgressInterface,
  chapterIndex: 0,

  setInitialState: async (comicId, chapterId): Promise<void> => {
    const { setChapterIndex, setReadProgress, setReadProgressDB, setInitialState } =
      useReaderStore.getState()
    const { comic, setComic } = useDashboardStore.getState()

    if (!comic.id) {
      await setComic(comicId)
      await setInitialState(comicId, chapterId)
    } else {
      const chapterIndex = comic.chapters.findIndex((val: ChapterInterface) => val.id === chapterId)

      await setChapterIndex(chapterIndex)

      const chapter = comic.chapters[chapterIndex]

      const totalPages = JSON.parse(chapter.pages).length - 1

      if (chapter.ReadProgress.length) {
        await setReadProgress(chapter.ReadProgress[0])
      } else {
        const { currentUser } = usePersistStore.getState()

        const newReadProgress = {
          chapterId,
          comicId: comic.id,
          page: 0,
          userId: currentUser.id ?? 0,
          totalPages
        }
        await setReadProgressDB(newReadProgress)
        await setComic(comic.id)
        await setInitialState(comic.id, chapterId)
      }
    }

    return new Promise((resolve) => resolve())
  },

  setChapterIndex: async (chapterIndex): Promise<void> => {
    set((state: useReaderStore) => ({ ...state, chapterIndex }))
    return new Promise((resolve) => resolve())
  },

  setReadProgress: async (readProgress): Promise<void> => {
    set((state: useReaderStore) => ({ ...state, readProgress }))
    return new Promise((resolve) => resolve())
  },

  setReadProgressDB: async (readProgress): Promise<void> => {
    await invoke('dbUpdateReadProgress', { readProgress })
  },

  resetReader: (): void => set(() => initialState(set))
})

const useReaderStore = create<useReaderStore>((set) => initialState(set))

export default useReaderStore

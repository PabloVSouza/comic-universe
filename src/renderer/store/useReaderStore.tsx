import { create, StoreApi } from 'zustand'
import useGlobalStore from './useGlobalStore'
import usePersistStore from './usePersistStore'
import useApi from 'api'

const { invoke } = useApi()

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
    const { activeComic, setActiveComic } = useGlobalStore.getState()

    if (!activeComic.id) {
      // await setComic(comic)
      await setInitialState(comicId, chapterId)
    } else {
      const chapterIndex = activeComic.chapters.findIndex(
        (val: ChapterInterface) => val.id === chapterId
      )

      await setChapterIndex(chapterIndex)

      const chapter = activeComic.chapters[chapterIndex]

      const totalPages = JSON.parse(chapter.pages).length

      if (chapter.ReadProgress.length) {
        await setReadProgress(chapter.ReadProgress[0])
      } else {
        const { currentUser } = usePersistStore.getState()

        const newReadProgress = {
          chapterId,
          comicId: activeComic.id,
          page: 1,
          userId: currentUser.id ?? 0,
          totalPages
        }
        await setReadProgressDB(newReadProgress)
        setActiveComic(activeComic)
        await setInitialState(activeComic.id, chapterId)
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

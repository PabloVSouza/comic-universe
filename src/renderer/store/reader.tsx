import { create } from 'zustand'
import useDashboard from './dashboard'

const { invoke } = window.Electron.ipcRenderer

interface useReader {
  chapter: Chapter
  page: number
  pages: Page[]
  chapters: Chapter[]
  activeComic: Comic
  getChapterData: (comicId?: string, number?: string) => Promise<void>
  changePage: (page: number) => Promise<void>
  setActiveComic: (activeComic: Comic) => void
  setChapters: (chapters: Chapter[]) => void
  setPages: (pages: Page[]) => void
  setChapter: (chapter: Chapter) => void
  setPage: (page: number) => void
}

const useReader = create<useReader>((set) => ({
  chapter: {} as Chapter,
  page: 0,
  pages: [],
  chapters: [],
  activeComic: {} as Comic,

  getChapterData: async (comicId, number): Promise<void> => {
    const { setChapter, setPages, setChapters, setActiveComic, setPage } = useReader.getState()
    const { list } = useDashboard.getState()

    const comic = list.find((val) => val._id === comicId) as Comic

    setActiveComic(comic)

    const chapters = (await invoke('dbGetChapters', { comicId })) as Chapter[]
    setChapters(chapters)

    const chapter = chapters.find((val) => val.number === number)

    if (chapter) {
      setChapter(chapter)
      let ReadProgress: ReadProgress
      ReadProgress = (
        await invoke('dbGetReadProgress', {
          chapterId: chapter._id
        })
      )[0]

      if (!ReadProgress) {
        ReadProgress = await invoke('dbUpdateReadProgress', {
          comicId: comic._id,
          chapter,
          page: 0
        })
      }

      setPages(chapter.pages)
      setPage(ReadProgress.page)
    }

    return new Promise((resolve) => {
      resolve()
    })
  },

  changePage: async (page): Promise<void> => {
    const { chapter, setPage } = useReader.getState()

    await invoke('dbUpdateReadProgress', {
      chapter,
      page
    })
    setPage(page)
  },

  setActiveComic: (activeComic): void => set((state) => ({ ...state, activeComic })),
  setChapters: (chapters): void => set((state) => ({ ...state, chapters })),
  setPages: (pages): void => set((state) => ({ ...state, pages })),
  setChapter: (chapter): void => set((state) => ({ ...state, chapter })),
  setPage: (page): void => set((state) => ({ ...state, page }))
}))

export default useReader

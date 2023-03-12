import { create } from "zustand";
import useDashboard from "./dashboard";

const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  chapter: {},
  page: 0,
  pages: [],
  chapters: [],
  activeComic: {},

  getChapterData: async (comicId, number) => {
    const { setChapter, setPages, setChapters, setActiveComic, setPage } =
      useReader.getState();
    const { list } = useDashboard.getState();

    const comic = list.find((val) => val._id === comicId);

    setActiveComic(comic);

    const chapters = await invoke("getChaptersDB", { comicId });
    setChapters(chapters);

    const chapter = chapters.find((val) => val.number === number);

    setChapter(chapter);

    let ReadProgress;
    ReadProgress = await invoke("getReadProgressDB", {
      chapterId: chapter._id,
    });

    if (!ReadProgress) {
      ReadProgress = await invoke("changePageDB", {
        comicId: comic._id,
        chapter,
        page: 0,
      });
    }

    await setPages(chapter.pages);
    await setPage(ReadProgress.page);
    return new Promise((resolve) => {
      resolve();
    });
  },

  changePage: async (page) => {
    const { chapter, setPage } = useReader.getState();

    await invoke("changePageDB", {
      chapter,
      page,
    });
    setPage(page);
  },

  setActiveComic: (activeComic) => set((state) => ({ ...state, activeComic })),
  setChapters: (chapters) => set((state) => ({ ...state, chapters })),
  setPages: (pages) => set((state) => ({ ...state, pages })),
  setChapter: (chapter) => set((state) => ({ ...state, chapter })),
  setPage: (page) => set((state) => ({ ...state, page })),
});

const useReader = create((set) => initialState(set));

export default useReader;

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
    const { setChapter, setPages, setChapters, setActiveComic } =
      useReader.getState();
    const { list } = useDashboard.getState();

    const comic = list.find((val) => val._id === comicId);

    setActiveComic(comic);

    const chapters = await invoke("getChaptersDB", { comicId });
    setChapters(chapters);

    const chapter = chapters.find((val) => val.number === number);

    setChapter(chapter);

    setPages(chapter.pages);
  },

  setActiveComic: (activeComic) => set((state) => ({ ...state, activeComic })),
  setChapters: (chapters) => set((state) => ({ ...state, chapters })),
  setPages: (pages) => set((state) => ({ ...state, pages })),
  setChapter: (chapter) => set((state) => ({ ...state, chapter })),
  setPage: (page) => set((state) => ({ ...state, page })),
});

const useReader = create((set) => initialState(set));

export default useReader;

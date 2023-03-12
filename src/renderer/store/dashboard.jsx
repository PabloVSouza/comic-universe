import { create } from "zustand";
const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  activeComic: {},
  chapters: [],
  list: [],

  getListDB: async () => {
    const list = await invoke("getListDB");
    set((state) => ({ ...state, list }));
    set((state) => ({ ...state, activeComic: list[0] }));
  },

  getChaptersDB: async () => {
    const { activeComic } = useDashboard.getState();
    const chapters = await invoke("getChaptersDB", {
      comicId: activeComic._id,
    });

    set((state) => ({ ...state, chapters }));
  },

  getReadProgress: async (chapterId) => {
    return new Promise((resolve) => {
      invoke("getReadProgressDB", {
        chapterId,
      }).then((res) => {
        resolve(res);
      });
    });
  },

  changeReadProgress: async (chapter, page) => {
    await invoke("changePageDB", {
      comicId: chapter.comicId,
      chapter,
      page,
    });
  },

  setActiveComic: (comic) => set((state) => ({ ...state, activeComic: comic })),

  resetReader: () => set(initialState),
});

const useDashboard = create((set) => initialState(set));

const { getListDB, getChaptersDB } = useDashboard.getState();
getListDB();

export default useDashboard;

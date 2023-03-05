import { create } from "zustand";
const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  activeComic: {},
  chapters: [],
  list: [],

  getListDB: async () => {
    const list = await invoke("getListDB");
    set((state) => ({ ...state, list }));
  },

  getChaptersDB: async () => {
    const { activeComic } = useDashboard.getState();
    const chapters = await invoke("getChaptersDB", {
      comicId: activeComic._id,
    });

    set((state) => ({ ...state, chapters }));
  },

  setActiveComic: (comic) => set((state) => ({ ...state, activeComic: comic })),

  resetReader: () => set(initialState),
});

const useDashboard = create((set) => initialState(set));

const { getListDB } = useDashboard.getState();
getListDB();

export default useDashboard;

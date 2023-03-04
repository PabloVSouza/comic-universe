import { create } from "zustand";
const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  list: [],
  activeComic: {},

  getListDB: async () => {
    const list = await invoke("getListDB");
    set((state) => ({ ...state, list }));
  },

  setActiveComic: (comic) => set((state) => ({ ...state, activeComic: comic })),

  resetReader: () => set(initialState),
});

const useDashboard = create((set) => initialState(set));

const { getListDB } = useDashboard.getState();
getListDB();

export default useDashboard;

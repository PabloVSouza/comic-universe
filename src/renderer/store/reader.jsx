import { create } from "zustand";
const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  list: [],
  activeComic: {},

  getListDB: async () => {
    const list = await invoke("getListDB");
    set((state) => ({ ...state, list }));
  },

  resetReader: () => set(initialState),
});

const useReader = create((set) => initialState(set));

const { getListDB } = useReader.getState();
getListDB();

export default useReader;

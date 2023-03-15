import { create } from "zustand";
const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  theme: "dark",
  lang: "ptBR",
  appPath: "",
  menuVisible: false,

  switchTheme: () =>
    set((state) =>
      state.theme === "dark" ? { theme: "light" } : { theme: "dark" }
    ),

  toggleMenu: () =>
    set((state) => ({ ...state, menuVisible: !state.menuVisible })),

  getAppPath: async () => {
    const appPath = await invoke("getAppPath");
    set((state) => ({ ...state, appPath }));
  },

  resetGlobal: (set) => set(initialState(set)),
});

const useGlobal = create((set) => initialState(set));
export default useGlobal;

const { getAppPath } = useGlobal.getState();
getAppPath();

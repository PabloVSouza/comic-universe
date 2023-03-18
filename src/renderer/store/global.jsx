import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
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

  changeLanguage: () =>
    set((state) => ({
      ...state,
      lang: state.lang === "ptBR" ? "enUS" : "ptBR",
    })),

  resetGlobal: (set) => set(initialState(set)),
});

export const usePersistedData = create(
  persist(
    (set, get) => ({
      theme: "dark",
      switchTheme: (theme) =>
        set({ theme: theme || get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: "comic-universe",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const useGlobal = create((set) => initialState(set));
export default useGlobal;

const { getAppPath } = useGlobal.getState();
getAppPath();

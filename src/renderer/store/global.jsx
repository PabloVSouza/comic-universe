import { create } from "zustand";

const initialState = (set) => ({
  theme: "dark",

  switchTheme: () =>
    set((state) => (state.theme === "dark" ? "light" : "dark")),

  resetGlobal: () => set(initialState),
});

const useGlobal = create((set) => initialState(set));
export default useGlobal;

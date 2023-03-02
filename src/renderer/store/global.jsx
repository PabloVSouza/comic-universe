import { create } from "zustand";

const initialState = (set) => ({
  theme: "dark",

  switchTheme: () =>
    set((state) =>
      state.theme === "dark" ? { theme: "light" } : { theme: "dark" }
    ),

  resetGlobal: (set) => set(initialState(set)),
});

const useGlobal = create((set) => initialState(set));
export default useGlobal;

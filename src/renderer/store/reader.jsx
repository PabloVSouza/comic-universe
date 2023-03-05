import { create } from "zustand";

const initialState = (set) => ({
  chapter: {},
  page: 0,

  setChapter: (chapter) => set((state) => ({ ...state, chapter })),
  setPage: (page) => set((state) => ({ ...state, page })),
});

const useReader = create((set) => initialState(set));

export default useReader;

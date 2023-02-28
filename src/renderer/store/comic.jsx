import { create } from "zustand";
import merge from "lodash.merge";

const { invoke } = window.electron.ipcRenderer;

const initialState = (set) => ({
  currentComic: {},
  queue: [],
  chapters: [],

  setComicData: (data) => set(async (state) => await merge(state, data)),
  getChapters: async (id) => {
    const chapters = await invoke("getChapters", {
      type: "manga",
      id,
    });

    set(async (state) => await merge(state, { chapters }));
  },

  resetComic: () => set(initialState(set), true),
});

export const useComicData = create((set) => initialState(set));

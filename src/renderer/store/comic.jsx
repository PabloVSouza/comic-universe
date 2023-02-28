import { create } from "zustand";
import merge from "lodash.merge";

const initialState = {
  current: {},
  queue: {},
  chapters: {},
};

export const useComicData = create((set) => ({
  current: {},
  queue: {},
  chapters: {},

  setComic: (data) => set(async (state) => await merge(state, data)),

  resetComic: () => set(initialState),
}));

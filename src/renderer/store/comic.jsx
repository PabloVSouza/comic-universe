import { create } from "zustand";
import merge from "lodash.merge";
import omit from "lodash.omit";

const { invoke } = window.electron.ipcRenderer;

const initialState = (set) => ({
  currentComic: {},
  queue: [],
  chapters: [],
  downloadedChapters: [],
  list: [],
  selectedComic: {},

  getComicData: async (id) => {
    const data = {};

    const inDatabase = await invoke("dbFindOne", {
      table: "Comic",
      query: {
        id,
      },
    });

    if (inDatabase) {
      data.currentComic = inDatabase;

      const downloadedChapters = await invoke("dbFind", {
        table: "Chapter",
        query: {
          hqId: inDatabase._id,
        },
      });

      if (downloadedChapters) data.downloadedChapters = downloadedChapters;
    }

    const state = useComicData.getState();

    if (!inDatabase) {
      if (state.list.length === 0) await state.getList();

      const comic = await state.list.find((val) => val.id == id);

      if (!comic.synopsis || !comic.cover) await state.getDetails(id);

      data.currentComic = comic;
    }

    await state.setComicData(data);
    await state.getChapters();
  },

  getList: async () => {
    const list = await invoke("getList", { type: "hq" });
    return new Promise((resolve) => {
      resolve(
        set(async (state) => {
          const data = await merge(state, { list });
          return data;
        })
      );
    });
  },

  getDetails: async (id) => {
    const data = await invoke("getDetails", {
      type: "hq",
      id,
    });

    const state = useComicData.getState();
    const { list } = state;

    let item = list.find((val) => val.id == id);

    item = await merge(item, data);

    const mergeData = await merge(state, { list });

    return new Promise((resolve) => {
      resolve(set(mergeData));
    });
  },

  getChapters: async (id) => {
    const { currentComic } = useComicData.getState();

    const chapters = !currentComic.chapters
      ? await invoke("getChapters", {
          type: "hq",
          id,
        })
      : currentComic.chapters;

    return new Promise((resolve) => {
      set(async (state) => await merge(state, { chapters }));
      resolve();
    });
  },

  downloadChapter: (data) => {},

  setQueue: (data) => set((state) => (state.queue = data)),

  setComicData: (data) => set(async (state) => await merge(state, data)),

  resetComic: () => set(omit(initialState(set), ["list"]), true),
});

const useComicData = create((set) => initialState(set));

const state = useComicData.getState();

state.getList();

export default useComicData;

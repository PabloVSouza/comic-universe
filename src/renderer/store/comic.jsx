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
          mangaId: inDatabase._id,
        },
      });

      if (downloadedChapters) data.downloadedChapters = downloadedChapters;
    }

    const state = useComicData.getState();

    if (!inDatabase) {
      if (state.list.length === 0) await state.getList();

      const comic = await state.list.find((val) => val.id === id);

      if (comic.synopsis == undefined) await state.getDetails(comic.idSite);

      data.currentComic = comic;
    }

    await state.getChapters(id);
    await state.setComicData(data);
  },

  getList: async () => {
    const list = await invoke("getList", { type: "manga" });

    return new Promise((resolve) => {
      set(async (state) => {
        const data = await merge(state, { list });
        return data;
      });
      resolve();
    });
  },

  getDetails: async (idSite) => {
    const data = await invoke("getDetails", {
      type: "manga",
      id: idSite,
    });

    return new Promise((resolve) => {
      set(async (state) => {
        const { list } = state;
        let item = list.find((val) => val.idSite === idSite);

        item = await merge(item, data);

        return await merge(state, { list });
      });
      resolve();
    });
  },

  getChapters: async (id) => {
    const chapters = await invoke("getChapters", {
      type: "manga",
      id,
    });
    return new Promise((resolve) => {
      set(async (state) => await merge(state, { chapters }));
      resolve();
    });
  },

  setComicData: (data) => set(async (state) => await merge(state, data)),

  resetComic: () => set(omit(initialState(set), ["list"]), true),
});

const useComicData = create((set) => initialState(set));

const state = useComicData.getState();

state.getList();

export default useComicData;

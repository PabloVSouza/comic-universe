import { create } from "zustand";
import merge from "lodash.merge";

const { invoke } = window.Electron.ipcRenderer;

const initialState = (set) => ({
  type: "hq",
  comic: {},
  queue: [],
  chapters: [],
  downloadedChapters: [],
  list: [],
  selectedComic: {},

  getComicData: async (id) => {
    const data = {};
    const inDatabase = await invoke("getComicDB", { id: String(id) });

    if (inDatabase) {
      data.comic = inDatabase;

      const downloadedChapters = await invoke("getChaptersDB", {
        comicId: inDatabase._id,
      });

      if (downloadedChapters) data.downloadedChapters = downloadedChapters;
    }

    const state = useComicData.getState();

    if (!inDatabase) {
      if (state.list.length === 0) await state.getList();

      const comic = await state.list.find((val) => val.id == id);

      if (!comic.synopsis || !comic.cover) await state.getDetails(id);

      data.comic = comic;
    }

    await state.setComicData(data);
    await state.getChapters();
  },

  getList: async () => {
    const { type } = useComicData.getState();

    const list = await invoke("getList", { type });
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
    const { list, type, setComicData } = useComicData.getState();

    const data = await invoke("getDetails", { type, id });

    let item = list.find((val) => val.id == id);

    item = await merge(item, data);

    await setComicData({ list });

    return new Promise((resolve) => {
      resolve();
    });
  },

  getChapters: async (id) => {
    const { type } = useComicData.getState();

    const { comic } = useComicData.getState();

    const chapters = !comic.chapters
      ? await invoke("getChapters", { type, id: comic.id })
      : comic.chapters;

    return new Promise((resolve) => {
      set(async (state) => await merge(state, { chapters }));
      resolve();
    });
  },

  downloadChapter: async (chapter) => {
    const { comic, type, getComicData } = useComicData.getState();

    if (!chapter.pages) {
      await invoke("getPages", { type, comic, chapter });
    }

    comic.type = type;

    const downloadData = {
      type,
      comic,
      chapter,
    };

    const chapterFiles = await invoke("downloadChapter", downloadData);

    comic.cover = chapterFiles.cover;

    chapter.pages = chapterFiles.pageFiles;

    delete comic.chapters;

    await invoke("createComicDB", { comic, chapter });

    await getComicData(comic.id);

    return new Promise((resolve) => {
      resolve();
    });
  },

  setQueue: (data) => set((state) => ({ ...state, queue: data })),

  setComicData: (data) => set(async (state) => await merge(state, data)),

  resetComic: () =>
    set((state) => ({ ...initialState(set), list: state.list })),
});

const useComicData = create((set) => initialState(set));

const state = useComicData.getState();

state.getList();

export default useComicData;

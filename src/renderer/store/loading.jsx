import { create } from "zustand";

const initialState = (set) => ({
  status: false,
  message: "",
  progress: {
    current: 0,
    total: 0,
  },

  setLoading: (data) => set(data),

  resetLoading: () => set(initialState),
});

const useLoading = create((set) => initialState(set));

export default useLoading;

const { on } = window.Electron.ipcRenderer;

on("loading", (event, data) => {
  useLoading.getState().setLoading(data);
});

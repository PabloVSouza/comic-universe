import { create } from "zustand";
import merge from "lodash.merge";

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

export const useLoading = create((set) => initialState(set));

const { on } = window.electron.ipcRenderer;

on("loading", (event, data) => {
  useLoading.getState().setLoading(data);
});

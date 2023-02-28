import { create } from "zustand";
import merge from "lodash.merge";

const initialState = {
  status: false,
  label: "",
  progress: {
    current: 0,
    total: 0,
  },
};

export const useLoading = create((set) => ({
  status: false,
  label: "",
  progress: {
    current: 0,
    total: 0,
  },

  setLoading: (data) => set(async (state) => await merge(state, data)),

  resetLoading: () => set(initialState),
}));

const { on } = window.electron.ipcRenderer;

on("loading", (event, data) => {
  useLoading.getState().setLoading(data);
});

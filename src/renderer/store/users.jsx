import { create } from "zustand";

const initialState = (set) => ({
  usersList: [],

  getUsersList: async () => {},

  resetLoading: () => set(initialState),
});

const useUsers = create((set) => initialState(set));

export default useUsers;

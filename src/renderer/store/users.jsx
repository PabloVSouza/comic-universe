import { create } from 'zustand'

const initialState = (set) => ({
  usersList: [],

  getUsersList: async () => {}
})

const useUsers = create((set) => initialState(set))

export default useUsers

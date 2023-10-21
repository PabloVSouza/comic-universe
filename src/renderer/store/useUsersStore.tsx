import { create } from 'zustand'

const { invoke } = window.Electron.ipcRenderer

interface useUsersStore {
  users: UserInterface[]
  getUsers: () => Promise<void>
}

const useUsersStore = create<useUsersStore>((set) => ({
  users: [],
  getUsers: async (): Promise<void> => {
    const users = await invoke('dbGetAllUsers')
    set((state) => ({ ...state, users }))
  }
}))

export default useUsersStore

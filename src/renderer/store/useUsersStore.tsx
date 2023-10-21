import { create } from 'zustand'

const { invoke } = window.Electron.ipcRenderer

interface useUsersStore {
  users: UserInterface[]
  getUsers: () => Promise<void>
  updateUser: (user: UserInterface) => Promise<void>
  deleteUser: (id: number) => Promise<void>
}

const useUsersStore = create<useUsersStore>((set) => ({
  users: [],

  getUsers: async (): Promise<void> => {
    const users = await invoke('dbGetAllUsers')
    set((state) => ({ ...state, users }))
  },

  updateUser: async (user): Promise<void> => {
    await invoke('dbUpdateUser', { user })
    const { getUsers } = useUsersStore.getState()
    await getUsers()
  },

  deleteUser: async (id): Promise<void> => {
    await invoke('dbDeleteUser', { id })
    const { getUsers } = useUsersStore.getState()
    await getUsers()
  }
}))

export default useUsersStore

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useGlobalStore from './useGlobalStore'

interface IusePersistSessionStore {
  currentUser: IUser
  setCurrentUser: (currentUser: IUser) => void
}

const { appParams } = useGlobalStore.getState()

const usePersistSessionStore = create<IusePersistSessionStore>()(
  persist(
    (set) => ({
      currentUser: {} as IUser,
      setCurrentUser: (currentUser) => set({ currentUser })
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

export default usePersistSessionStore

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useGlobalStore from './useGlobalStore'

interface IusePersistStore {
  theme: string
  repo: TOption
  switchTheme: (theme?: string) => void
  setRepo: (repo: TOption) => void
}

const { appParams } = useGlobalStore.getState()

const usePersistStore = create<IusePersistStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      repo: {} as TOption,

      switchTheme: (theme) =>
        set({ theme: theme || get().theme === 'dark' ? 'light' : 'dark' }),

      setRepo: (repo) => set({ repo })
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default usePersistStore

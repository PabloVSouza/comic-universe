import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useGlobalStore from './useGlobalStore'

interface IusePersistStore {
  theme: string
  lang: string
  currentUser: IUser
  repo: TOption
  switchTheme: (theme?: string) => void
  changeLanguage: (lang?: string) => void
  setCurrentUser: (currentUser: IUser) => void
  setRepo: (repo: TOption) => void
}

const { appParams } = useGlobalStore.getState()

const usePersistStore = create<IusePersistStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'ptBR',
      currentUser: {} as IUser,
      repo: {} as TOption,

      switchTheme: (theme): void =>
        set({ theme: theme || get().theme === 'dark' ? 'light' : 'dark' }),

      changeLanguage: (lang): void =>
        set({
          lang: lang || get().lang === 'ptBR' ? 'enUS' : 'ptBR'
        }),

      setCurrentUser: (currentUser): void => set({ currentUser }),

      setRepo: (repo): void => set({ repo })
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default usePersistStore

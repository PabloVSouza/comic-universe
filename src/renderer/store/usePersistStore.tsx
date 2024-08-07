import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
const { isDev } = window

interface usePersistStore {
  theme: string
  lang: string
  currentUser: UserInterface
  repo: string
  switchTheme: (theme?: string) => void
  changeLanguage: (lang?: string) => void
  setCurrentUser: (currentUser: UserInterface) => void
  setRepo: (repo: string) => void
}

const usePersistStore = create<usePersistStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'ptBR',
      currentUser: {} as UserInterface,
      repo: 'hqnow',

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
      name: isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default usePersistStore

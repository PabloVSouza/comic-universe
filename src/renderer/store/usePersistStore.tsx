import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface usePersistStore {
  theme: string
  lang: string
  currentUser: User
  repo: string
  switchTheme: (theme?: string) => void
  changeLanguage: (lang?: string) => void
  setCurrentUser: (currentUser: User) => void
  setRepo: (repo: string) => void
}

const usePersistStore = create<usePersistStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'ptBR',
      currentUser: {} as User,
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
      name: 'comic-universe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default usePersistStore

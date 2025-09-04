import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useGlobalStore from './useGlobalStore'

interface IusePersistStore {
  theme: string
  lang: string
  repo: TOption
  switchTheme: (theme?: string) => void
  changeLanguage: (lang?: string) => void
  setRepo: (repo: TOption) => void
}

const { appParams } = useGlobalStore.getState()

const usePersistStore = create<IusePersistStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'ptBR',
      repo: {} as TOption,

      switchTheme: (theme) => set({ theme: theme || get().theme === 'dark' ? 'light' : 'dark' }),

      changeLanguage: (lang) =>
        set({
          lang: lang || get().lang === 'ptBR' ? 'enUS' : 'ptBR'
        }),

      setRepo: (repo) => set({ repo })
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default usePersistStore

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useGlobalStore from './useGlobalStore'
import { createSettingsStorage } from './settingsStorage'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'

interface IusePersistStore {
  theme: { theme: string }
  repo: { repo: TOption }
  language: { language: string }
  debug: { enableDebugLogging: boolean }
  webUI: { enableWebUI: boolean }
  _hasHydrated: boolean
  switchTheme: (theme?: string) => void
  setRepo: (repo: TOption) => void
  setLanguage: (language: string) => void
  setDebugLogging: (enabled: boolean) => void
  setWebUI: (enabled: boolean) => void
}

const { appParams } = useGlobalStore.getState()

const usePersistStore = create<IusePersistStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      _hasHydrated: false,

      switchTheme: (theme) => {
        const newTheme = theme ?? (get().theme.theme === 'dark' ? 'light' : 'dark')
        set({ theme: { theme: newTheme } })
      },
      setRepo: (repo) => {
        set({ repo: { repo } })
      },
      setLanguage: (language) => {
        set({ language: { language } })
      },
      setDebugLogging: (enabled) => {
        set({ debug: { enableDebugLogging: enabled } })
      },
      setWebUI: (enabled) => {
        set({ webUI: { enableWebUI: enabled } })
      }
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => createSettingsStorage()),
      partialize: (state) => ({
        theme: state.theme,
        repo: state.repo,
        language: state.language,
        debug: state.debug,
        webUI: state.webUI
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      }
    }
  )
)

export default usePersistStore

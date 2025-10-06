import { settingsStorageUtils } from 'renderer-utils'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import useGlobalStore from './useGlobalStore'

interface IusePersistStore {
  theme: { theme: string }
  repo: { repo: TOption }
  language: { language: string }
  debug: { enableDebugLogging: boolean }
  webUI: { enableWebUI: boolean; autoPort?: boolean; port?: number }
  _hasHydrated: boolean
  switchTheme: (theme?: string) => void
  setRepo: (repo: TOption) => void
  setLanguage: (language: string) => void
  setDebugLogging: (enabled: boolean) => void
  setWebUI: (enabled: boolean, autoPort?: boolean, port?: number) => void
  setWebUIAutoPort: (autoPort: boolean) => void
  setWebUIPort: (port: number) => void
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
      setWebUI: (enabled, autoPort?: boolean, port?: number) => {
        set((state) => ({
          webUI: {
            enableWebUI: enabled,
            autoPort: autoPort !== undefined ? autoPort : state.webUI.autoPort,
            port: port !== undefined ? port : state.webUI.port
          }
        }))
      },
      setWebUIAutoPort: (autoPort) => {
        set((state) => ({
          webUI: {
            ...state.webUI,
            autoPort
          }
        }))
      },
      setWebUIPort: (port) => {
        set((state) => ({
          webUI: {
            ...state.webUI,
            port
          }
        }))
      }
    }),
    {
      name: appParams.isDev ? 'comic-universe-dev' : 'comic-universe',
      storage: createJSONStorage(() => settingsStorageUtils.createSettingsStorage()),
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

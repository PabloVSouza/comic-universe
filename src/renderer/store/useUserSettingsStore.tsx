import { create } from 'zustand'

interface UserSettingsStore {
  settings: IUserSettings
  deviceName: string
  isLoading: boolean

  setSettings: (settings: IUserSettings) => void
  setDeviceName: (name: string) => void
  setIsLoading: (loading: boolean) => void

  loadUserSettings: (
    userId: string,
    invoke: (method: string, args?: unknown) => Promise<unknown>
  ) => Promise<void>

  updateSetting: (
    userId: string,
    category: keyof IUserSettings,
    key: string,
    value: string | null | boolean,
    invoke: (method: string, args?: unknown) => Promise<unknown>,
    invalidateQueries: (queryKey: string[]) => void
  ) => Promise<void>

  toggleAutoSync: (
    userId: string,
    invoke: (method: string, args?: unknown) => Promise<unknown>,
    invalidateQueries: (queryKey: string[]) => void
  ) => Promise<void>

  disconnectFromWebsite: (
    userId: string,
    invoke: (method: string, args?: unknown) => Promise<unknown>,
    invalidateQueries: (queryKey: string[]) => void
  ) => Promise<void>

  generateDeviceName: () => void

  mergeSettings: (newSettings: IUserSettings | null) => void
}

const defaultSettings: IUserSettings = {
  readingPreferences: {
    readingDirection: 'ltr',
    defaultReadingMode: 'horizontal'
  },
  displayPreferences: {
    theme: 'inherit',
    wallpaper: null
  },
  appPreferences: {
    language: 'inherit'
  }
}

const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  settings: defaultSettings,
  deviceName: '',
  isLoading: false,

  setSettings: (settings) => set({ settings }),
  setDeviceName: (name) => set({ deviceName: name }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  generateDeviceName: () => {
    try {
      const userAgent = navigator.userAgent || ''

      let os = 'Unknown OS'
      if (userAgent.includes('Windows')) os = 'Windows'
      else if (userAgent.includes('Mac')) os = 'macOS'
      else if (userAgent.includes('Linux')) os = 'Linux'

      const deviceName = `${os} Device`
      set({ deviceName })
    } catch (error) {
      console.error('Failed to generate device name:', error)
      set({ deviceName: 'Comic Universe App' })
    }
  },

  loadUserSettings: async (userId, invoke) => {
    set({ isLoading: true })
    try {
      const userSettings = (await invoke('dbGetUserSettings', { userId })) as IUserSettings | null
      if (userSettings) {
        get().mergeSettings(userSettings)
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  mergeSettings: (newSettings) => {
    if (!newSettings) return

    set((state) => {
      const merged: IUserSettings = {
        ...state.settings,
        ...newSettings,
        readingPreferences: {
          ...state.settings.readingPreferences,
          ...newSettings.readingPreferences
        },
        displayPreferences: {
          ...state.settings.displayPreferences,
          ...newSettings.displayPreferences
        },
        appPreferences: {
          ...state.settings.appPreferences,
          ...newSettings.appPreferences
        }
      }

      if (newSettings.syncPreferences || state.settings.syncPreferences) {
        merged.syncPreferences = {
          autoSync:
            newSettings.syncPreferences?.autoSync ??
            state.settings.syncPreferences?.autoSync ??
            true
        }
      }

      if (newSettings.websiteAuth || state.settings.websiteAuth) {
        merged.websiteAuth = {
          isConnected:
            newSettings.websiteAuth?.isConnected ??
            state.settings.websiteAuth?.isConnected ??
            false,
          websiteUrl: newSettings.websiteAuth?.websiteUrl ?? state.settings.websiteAuth?.websiteUrl,
          lastConnectedAt:
            newSettings.websiteAuth?.lastConnectedAt ?? state.settings.websiteAuth?.lastConnectedAt,
          deviceName: newSettings.websiteAuth?.deviceName ?? state.settings.websiteAuth?.deviceName
        }
      }

      return { settings: merged }
    })
  },

  updateSetting: async (userId, category, key, value, invoke, invalidateQueries) => {
    const { settings } = get()

    const newCategorySettings = {
      ...settings[category],
      [key]: value
    }

    const newSettings = {
      ...settings,
      [category]: newCategorySettings
    }

    set({ settings: newSettings })

    try {
      await invoke('dbUpdateUserSettings', {
        userId,
        settings: { [category]: newCategorySettings }
      })
      invalidateQueries(['userSettings', userId])
    } catch (error) {
      console.error('Failed to update setting:', error)
      set({ settings })
    }
  },

  toggleAutoSync: async (userId, invoke, invalidateQueries) => {
    const { settings } = get()
    const currentAutoSync = settings.syncPreferences?.autoSync ?? true
    const newAutoSync = !currentAutoSync

    const newSettings = {
      ...settings,
      syncPreferences: {
        ...settings.syncPreferences,
        autoSync: newAutoSync
      }
    }

    set({ settings: newSettings })

    try {
      await invoke('dbUpdateUserSettings', {
        userId,
        settings: { syncPreferences: { autoSync: newAutoSync } }
      })
      invalidateQueries(['userSettings', userId])
    } catch (error) {
      console.error('Failed to toggle auto sync:', error)
      set({ settings })
    }
  },

  disconnectFromWebsite: async (userId, invoke, invalidateQueries) => {
    try {
      await invoke('dbClearWebsiteAuthToken', { userId })

      const currentSettings = (await invoke('dbGetUserSettings', {
        userId
      })) as IUserSettings | null

      const updatedSettings: IUserSettings = {
        readingPreferences:
          currentSettings?.readingPreferences || defaultSettings.readingPreferences,
        displayPreferences:
          currentSettings?.displayPreferences || defaultSettings.displayPreferences,
        appPreferences: currentSettings?.appPreferences || defaultSettings.appPreferences,
        websiteAuth: {
          isConnected: false,
          lastConnectedAt: undefined,
          websiteUrl: currentSettings?.websiteAuth?.websiteUrl,
          deviceName: currentSettings?.websiteAuth?.deviceName
        }
      }

      if (currentSettings?.syncPreferences) {
        updatedSettings.syncPreferences = currentSettings.syncPreferences
      }

      await invoke('dbUpdateUserSettings', {
        userId,
        settings: updatedSettings
      })

      get().mergeSettings(updatedSettings)

      invalidateQueries(['websiteAuth', userId])
      invalidateQueries(['userSettings', userId])
    } catch (error) {
      console.error('Failed to disconnect from website:', error)
    }
  }
}))

export default useUserSettingsStore

import { StateStorage } from 'zustand/middleware'
import useApi from 'api'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { deepMerge } from 'shared-utils'

// Pre-load settings to avoid async issues
let cachedSettings: string | null = null

const loadSettingsOnce = async (): Promise<string> => {
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    const { invoke } = useApi()

    // Get all settings from settings.json in a single call
    const allSettings = await invoke('getAllSettings')

    // Merge defaults with loaded settings (loaded settings override defaults)
    const sourceSettings = {
      theme: allSettings.theme || DEFAULT_SETTINGS.theme,
      repo: allSettings.repo || DEFAULT_SETTINGS.repo,
      language: allSettings.language || DEFAULT_SETTINGS.language,
      debug: allSettings.debug || DEFAULT_SETTINGS.debug,
      webUI: allSettings.webUI || DEFAULT_SETTINGS.webUI
    }

    const state = deepMerge(DEFAULT_SETTINGS, sourceSettings)

    cachedSettings = JSON.stringify(state)
    return cachedSettings
  } catch (error) {
    console.error('❌ Error loading settings from settings.json:', error)
    // Return defaults if loading fails
    cachedSettings = JSON.stringify(DEFAULT_SETTINGS)
    return cachedSettings
  }
}

// Custom storage implementation for Zustand that uses settings.json
export const createSettingsStorage = (): StateStorage => {
  return {
    getItem: async (_name: string): Promise<string | null> => {
      const settings = await loadSettingsOnce()

      // Zustand expects the data to be wrapped in a 'state' property
      const wrappedSettings = { state: JSON.parse(settings) }
      const wrappedSettingsString = JSON.stringify(wrappedSettings)

      return wrappedSettingsString
    },

    setItem: async (_name: string, value: string): Promise<void> => {
      try {
        const { invoke } = useApi()
        const state = JSON.parse(value)

        // Extract the actual state from Zustand's structure
        const actualState = state.state || state

        // Use the nested structure directly (already in correct format)
        const settingsToUpdate: any = actualState

        await invoke('updateAllSettings', settingsToUpdate)

        // Clear cache so next getItem will reload from file
        cachedSettings = null
      } catch (error) {
        console.error('❌ Error saving settings to settings.json:', error)
        throw error
      }
    },

    removeItem: async (_name: string): Promise<void> => {
      // For now, we don't implement removal - settings persist in settings.json
    }
  }
}

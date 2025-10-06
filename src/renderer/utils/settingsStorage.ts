import useApi from 'api'
import { deepMerge } from 'shared/utils'
import { StateStorage } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'

const api = useApi()

let cachedSettings: string | null = null

const loadSettingsOnce = async (): Promise<string> => {
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    const allSettings = await api.invoke('getAllSettings', undefined)

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
    cachedSettings = JSON.stringify(DEFAULT_SETTINGS)
    return cachedSettings
  }
}

export const createSettingsStorage = (): StateStorage => {
  return {
    getItem: async (): Promise<string | null> => {
      const settings = await loadSettingsOnce()

      const wrappedSettings = { state: JSON.parse(settings) }
      const wrappedSettingsString = JSON.stringify(wrappedSettings)

      return wrappedSettingsString
    },

    setItem: async (_name: string, value: string): Promise<void> => {
      try {
        const state = JSON.parse(value)

        const actualState = state.state || state

        const settingsToUpdate: Record<string, unknown> = actualState

        await api.invoke('updateAllSettings', settingsToUpdate)

        cachedSettings = null
      } catch (error) {
        console.error('❌ Error saving settings to settings.json:', error)
        throw error
      }
    },

    removeItem: async (): Promise<void> => {}
  }
}

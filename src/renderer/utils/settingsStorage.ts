import { deepMerge } from 'shared/utils'
import { StateStorage } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import IpcImplementation from 'hooks/api/IpcImplementation'
import RestImplementation from 'hooks/api/RestImplementation'

const getApi = () => {
  if (typeof window !== 'undefined' && window.Electron) {
    return IpcImplementation
  }
  return RestImplementation
}

const api = getApi()

let cachedSettings: string | null = null

const loadSettingsOnce = async (): Promise<string> => {
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    const allSettings = await api.invoke<{
      theme?: string
      repo?: string
      language?: string
      debug?: boolean
      webUI?: unknown
    }>('getAllSettings', undefined)

    const sourceSettings = {
      theme: allSettings.theme || DEFAULT_SETTINGS.theme,
      repo: allSettings.repo || DEFAULT_SETTINGS.repo,
      language: allSettings.language || DEFAULT_SETTINGS.language,
      debug: allSettings.debug || DEFAULT_SETTINGS.debug,
      webUI: allSettings.webUI || DEFAULT_SETTINGS.webUI
    } as Partial<typeof DEFAULT_SETTINGS>

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

        await api.invoke<void>('updateAllSettings', settingsToUpdate)

        cachedSettings = null
      } catch (error) {
        console.error('❌ Error saving settings to settings.json:', error)
        throw error
      }
    },

    removeItem: async (): Promise<void> => {}
  }
}

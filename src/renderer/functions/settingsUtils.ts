import { useApi } from 'hooks'

export interface SettingsOutput {
  update?: {
    autoUpdate?: boolean
    optInNonStable?: boolean
    releaseTypes?: string[]
  }
  language?: {
    language?: string
  }
  debug?: {
    enableDebugLogging?: boolean
  }
  webUI?: {
    enableWebUI?: boolean
  }
}

export const useSettingsUtils = () => {
  const { invoke } = useApi()

  const saveSettings = async (settings: SettingsOutput) => {
    try {
      // Save each category of settings
      if (settings.update) {
        await invoke('updateUpdateSettings', { updateSettings: settings.update })
      }

      if (settings.language) {
        await invoke('updateLanguageSettings', { languageSettings: settings.language })
      }

      if (settings.debug) {
        await invoke('updateDebugSettings', { debugSettings: settings.debug })
      }

      if (settings.webUI) {
        await invoke('updateWebUISettings', { webUISettings: settings.webUI })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  }

  const loadSettings = async () => {
    try {
      const [updateSettings, languageSettings, debugSettings, webUISettings] = await Promise.all([
        invoke('getUpdateSettings'),
        invoke('getLanguageSettings'),
        invoke('getDebugSettings'),
        invoke('getWebUISettings')
      ])

      return {
        update: updateSettings,
        language: languageSettings,
        debug: debugSettings,
        webUI: webUISettings
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      throw error
    }
  }

  return {
    saveSettings,
    loadSettings
  }
}

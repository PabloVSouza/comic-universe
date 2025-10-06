import fs from 'fs'
import path from 'path'
import { DataPaths } from 'electron-utils'
import { deepMerge } from 'shared-utils'
import { DEFAULT_UPDATE_SETTINGS } from 'constants/defaultSettings'

export interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
}

export interface LanguageSettings {
  language: string
}

export interface DebugSettings {
  enableDebugLogging: boolean
}

export interface WebUISettings {
  enableWebUI: boolean
  port?: number
  autoPort?: boolean
}

export interface ThemeSettings {
  theme: string
}

export interface RepoSettings {
  repo: TOption
}

interface AppSettings {
  update: UpdateSettings
  language: LanguageSettings
  debug: DebugSettings
  webUI: WebUISettings
  theme: ThemeSettings
  repo: RepoSettings
  // Add other settings here in the future
}

class SettingsRepository {
  private settingsPath: string
  private defaultSettings: AppSettings = {
    ...DEFAULT_UPDATE_SETTINGS,
    language: {
      language: 'ptBR'
    },
    debug: {
      enableDebugLogging: false
    },
    webUI: {
      enableWebUI: true
    },
    theme: {
      theme: 'dark'
    },
    repo: {
      repo: {} as TOption
    }
  }

  constructor() {
    // Use the centralized data paths utility
    DataPaths.ensureDirectoryExists(DataPaths.getSettingsPath())
    this.settingsPath = DataPaths.getSettingsFilePath()
  }

  public methods = {
    // Load settings from file
    loadSettings: async (): Promise<AppSettings> => {
      try {
        if (fs.existsSync(this.settingsPath)) {
          const settingsData = fs.readFileSync(this.settingsPath, 'utf8')
          const settings = JSON.parse(settingsData)

          // Merge with defaults to ensure all properties exist
          return this.mergeWithDefaults(settings)
        } else {
          // Create default settings file if it doesn't exist
          await this.methods.saveSettings(this.defaultSettings)
          return this.defaultSettings
        }
      } catch (error) {
        return this.defaultSettings
      }
    },

    // Save settings to file
    saveSettings: async (settings: AppSettings): Promise<void> => {
      try {
        // Ensure the directory exists
        const settingsDir = path.dirname(this.settingsPath)
        if (!fs.existsSync(settingsDir)) {
          fs.mkdirSync(settingsDir, { recursive: true })
        }

        // Write settings to file
        fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), 'utf8')
      } catch (error) {
        throw error
      }
    },

    // Update specific settings section
    updateSettings: async (
      section: keyof AppSettings,
      newSettings: Partial<AppSettings[keyof AppSettings]>
    ): Promise<AppSettings> => {
      try {
        const currentSettings = await this.methods.loadSettings()
        const updatedSettings = {
          ...currentSettings,
          [section]: {
            ...currentSettings[section],
            ...newSettings
          }
        }

        await this.methods.saveSettings(updatedSettings)
        return updatedSettings
      } catch (error) {
        throw error
      }
    },

    // Get update settings specifically
    getUpdateSettings: async (): Promise<UpdateSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.update
    },

    // Update update settings specifically - moved to AppRepository to avoid IPC conflicts
    updateUpdateSettingsInternal: async (
      updateSettings: Partial<UpdateSettings>
    ): Promise<UpdateSettings> => {
      try {
        const currentSettings = await this.methods.loadSettings()
        const updatedSettings = {
          ...currentSettings,
          update: {
            ...currentSettings.update,
            ...updateSettings
          }
        }
        await this.methods.saveSettings(updatedSettings)
        return updatedSettings.update
      } catch (error) {
        throw error
      }
    },

    // Get language settings specifically
    getLanguageSettings: async (): Promise<LanguageSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.language
    },

    // Update language settings specifically
    updateLanguageSettings: async (
      languageSettings: Partial<LanguageSettings>
    ): Promise<LanguageSettings> => {
      const updatedSettings = await this.methods.updateSettings('language', languageSettings)
      return updatedSettings.language
    },

    // Get debug settings specifically
    getDebugSettings: async (): Promise<DebugSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.debug
    },

    // Update debug settings specifically
    updateDebugSettings: async (debugSettings: Partial<DebugSettings>): Promise<DebugSettings> => {
      const updatedSettings = await this.methods.updateSettings('debug', debugSettings)
      return updatedSettings.debug
    },

    // Get web UI settings specifically
    getWebUISettings: async (): Promise<WebUISettings> => {
      const settings = await this.methods.loadSettings()
      return settings.webUI
    },

    // Update web UI settings specifically
    updateWebUISettings: async (webUISettings: Partial<WebUISettings>): Promise<WebUISettings> => {
      const currentSettings = await this.methods.loadSettings()

      const updatedWebUISettings = {
        ...currentSettings.webUI,
        ...webUISettings
      }

      const updatedSettings = await this.methods.updateSettings('webUI', updatedWebUISettings)
      return updatedSettings.webUI
    },

    // Reset settings to defaults
    resetSettings: async (): Promise<AppSettings> => {
      await this.methods.saveSettings(this.defaultSettings)
      return this.defaultSettings
    },

    // Get theme settings specifically
    getThemeSettings: async (): Promise<ThemeSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.theme
    },

    // Update theme settings specifically
    updateThemeSettings: async (themeSettings: Partial<ThemeSettings>): Promise<ThemeSettings> => {
      const updatedSettings = await this.methods.updateSettings('theme', themeSettings)
      return updatedSettings.theme
    },

    // Get repo settings specifically
    getRepoSettings: async (): Promise<RepoSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.repo
    },

    // Update repo settings specifically
    updateRepoSettings: async (repoSettings: Partial<RepoSettings>): Promise<RepoSettings> => {
      const updatedSettings = await this.methods.updateSettings('repo', repoSettings)
      return updatedSettings.repo
    },

    // Get all settings at once
    getAllSettings: async (): Promise<AppSettings> => {
      return await this.methods.loadSettings()
    },

    // Update all settings at once by merging with existing settings
    updateAllSettings: async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
      const currentSettings = await this.methods.loadSettings()
      const mergedSettings = deepMerge(currentSettings, newSettings)
      await this.methods.saveSettings(mergedSettings)
      return mergedSettings
    },

    // Get settings file path (for debugging)
    getSettingsPath: (): string => {
      return this.settingsPath
    }
  }

  // Helper method to merge loaded settings with defaults
  private mergeWithDefaults(loadedSettings: unknown): AppSettings {
    const settings = loadedSettings as Partial<AppSettings>
    const merged: AppSettings = {
      update: {
        ...this.defaultSettings.update,
        ...(settings.update || {})
      },
      language: {
        ...this.defaultSettings.language,
        ...(settings.language || {})
      },
      debug: {
        ...this.defaultSettings.debug,
        ...(settings.debug || {})
      },
      webUI: {
        ...this.defaultSettings.webUI,
        ...(settings.webUI || {})
      },
      theme: {
        ...this.defaultSettings.theme,
        ...(settings.theme || {})
      },
      repo: {
        ...this.defaultSettings.repo,
        ...(settings.repo || {})
      }
    }

    return merged
  }
}

export default SettingsRepository

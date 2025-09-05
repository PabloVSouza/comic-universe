import { app } from 'electron'
import fs from 'fs'
import path from 'path'

interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

interface AppSettings {
  update: UpdateSettings
  // Add other settings here in the future
}

class SettingsRepository {
  private settingsPath: string
  private defaultSettings: AppSettings = {
    update: {
      autoUpdate: true,
      optInNonStable: false,
      releaseTypes: ['stable']
    }
  }

  constructor() {
    // Set the settings file path in the user data directory
    const userDataPath = app.getPath('userData')
    this.settingsPath = path.join(userDataPath, 'settings.json')
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
        console.error('Error loading settings:', error)
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
        console.log('Settings saved successfully')
      } catch (error) {
        console.error('Error saving settings:', error)
        throw error
      }
    },

    // Update specific settings section
    updateSettings: async (section: keyof AppSettings, newSettings: Partial<AppSettings[keyof AppSettings]>): Promise<AppSettings> => {
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
        console.error('Error updating settings:', error)
        throw error
      }
    },

    // Get update settings specifically
    getUpdateSettings: async (): Promise<UpdateSettings> => {
      const settings = await this.methods.loadSettings()
      return settings.update
    },

    // Update update settings specifically
    updateUpdateSettings: async (updateSettings: Partial<UpdateSettings>): Promise<UpdateSettings> => {
      const updatedSettings = await this.methods.updateSettings('update', updateSettings)
      return updatedSettings.update
    },

    // Reset settings to defaults
    resetSettings: async (): Promise<AppSettings> => {
      await this.methods.saveSettings(this.defaultSettings)
      return this.defaultSettings
    },

    // Get settings file path (for debugging)
    getSettingsPath: (): string => {
      return this.settingsPath
    }
  }

  // Helper method to merge loaded settings with defaults
  private mergeWithDefaults(loadedSettings: any): AppSettings {
    const merged: AppSettings = {
      update: {
        ...this.defaultSettings.update,
        ...(loadedSettings.update || {})
      }
    }

    return merged
  }
}

export default SettingsRepository

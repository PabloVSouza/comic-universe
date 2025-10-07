import SettingsRepository from '../repositories/Methods/SettingsRepository'

class DebugLogger {
  private static debugEnabled: boolean = false
  private static initialized: boolean = false
  private static settingsRepository: SettingsRepository | null = null

  private static async initialize() {
    if (this.initialized) return

    try {
      if (!this.settingsRepository) {
        this.settingsRepository = new SettingsRepository()
      }
      const debugSettings = await this.settingsRepository.methods.getDebugSettings()
      this.debugEnabled = debugSettings?.enableDebugLogging || false
      this.initialized = true
    } catch (error) {
      console.error('Failed to load debug settings:', error)
      this.debugEnabled = false
      this.initialized = true
    }
  }

  static async log(message: string, ...args: unknown[]): Promise<void> {
    await this.initialize()
    if (this.debugEnabled) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }

  static async error(message: string, ...args: unknown[]): Promise<void> {
    await this.initialize()
    if (this.debugEnabled) {
      console.error(`[DEBUG ERROR] ${message}`, ...args)
    }
  }

  static async warn(message: string, ...args: unknown[]): Promise<void> {
    await this.initialize()
    if (this.debugEnabled) {
      console.warn(`[DEBUG WARN] ${message}`, ...args)
    }
  }

  static async info(message: string, ...args: unknown[]): Promise<void> {
    await this.initialize()
    if (this.debugEnabled) {
      console.info(`[DEBUG INFO] ${message}`, ...args)
    }
  }

  static async refreshSettings(): Promise<void> {
    this.initialized = false
    await this.initialize()
  }
}

export default DebugLogger

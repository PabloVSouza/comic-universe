interface IUserSettings {
  // Reading preferences
  readingPreferences: {
    readingDirection: 'ltr' | 'rtl'
    defaultReadingMode: 'horizontal' | 'vertical'
  }

  // Display preferences
  displayPreferences: {
    theme: 'inherit' | 'light' | 'dark' | 'auto'
    wallpaper: string | null // path to custom wallpaper
  }

  // App preferences
  appPreferences: {
    language: 'inherit' | 'enUS' | 'ptBR'
  }

  // Website authentication
  websiteAuth?: {
    isConnected: boolean
    websiteUrl?: string // Website base URL
    lastConnectedAt?: string // ISO date string
    deviceName?: string
  }
}

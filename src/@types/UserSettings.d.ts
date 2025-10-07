interface IUserSettings {
  readingPreferences: {
    readingDirection: 'ltr' | 'rtl'
    defaultReadingMode: 'horizontal' | 'vertical'
  }

  displayPreferences: {
    theme: 'inherit' | 'light' | 'dark' | 'auto'
    wallpaper: string | null
  }

  appPreferences: {
    language: 'inherit' | 'enUS' | 'ptBR'
  }

  syncPreferences?: {
    autoSync: boolean
  }

  websiteAuth?: {
    isConnected: boolean
    websiteUrl?: string
    lastConnectedAt?: string
    deviceName?: string
  }
}

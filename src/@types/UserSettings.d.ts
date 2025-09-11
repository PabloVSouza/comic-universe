interface IUserSettings {
  // Reading preferences
  readingPreferences: {
    readingDirection: 'ltr' | 'rtl'
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
}

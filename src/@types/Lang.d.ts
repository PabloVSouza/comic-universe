interface DashboardLang {
  setComplete: string
  resetProgress: string
  read: string
  continueReading: string
  downloadMore: string
}

interface DownloadComicLang {
  chaptersTitle: string
  navigation: {
    downloadQueue: string
    downloadButton: string
    addToQueue: string
    removeFromQueue: string
  }
}

interface RightNavLang {
  about: string
  settings: string
  darkMode: string
  changeUser: string
}

interface SearchComicLang {
  textPlaceholder: string
  bookmarkComic: string
  availableChapters: string
  pagination: {
    previous: string
    next: string
  }
}

interface SettingsLang {
  title: string
  pages: {
    header: string
    pageDirectionOptions: {
      leftToRight: string
      rightToLeft: string
    }
  }
  wallpaper: {
    header: string
    wallpaperMode: string
    uploadWallpaper: string
  }
  selectLanguage: string
}

interface UsersLang {
  header: string
  createButton: string
  saveButton: string
  cancelButton: string
  namePlaceholder: string
}

interface Lang {
  Dashboard: DashboardLang
  DownloadComic: DownloadComicLang
  RightNav: RightNavLang
  SearchComic: SearchComicLang
  Settings: SettingsLang
  Users: UsersLang
}

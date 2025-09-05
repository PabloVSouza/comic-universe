interface GenerlLang {
  inDevelopment: string
  alertConfirmButton: string
}

interface DashboardLang {
  setComplete: string
  resetProgress: string
  read: string
  continueReading: string
  downloadMore: string
  newChapter: {
    noNewChapterMessage: string
    noNewChapterConfirm: string
  }
  contextMenu: {
    deleteComic: {
      title: string
      confirmMessage: string
      confirmOk: string
      confirmCancel: string
    }
  }
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

interface HomeNavLang {
  about: string
  settings: string
  darkMode: string
  changeUser: string
  closeApp: string
}

interface SearchComicLang {
  windowTitle: string
  textPlaceholder: string
  bookmarkComic: string
  alreadyBookmarked: string
  availableChapters: string
  noReposAvailable: string
}

interface PaginationLang {
  previous: string
  next: string
}

interface SettingsLang {
  windowTitle: string
  options: {
    generalLabel: string
    userLabel: string
    pluginsLabel: string
  }
  general: {
    updatePreferences: string
    autoUpdate: string
    checkForUpdates: string
    currentVersion: string
    releaseTypes: string
    stableReleases: string
    betaReleases: string
    alphaReleases: string
    nightlyReleases: string
    optInNonStable: string
    optInDescription: string
    saveSettings: string
    settingsSaved: string
    updateCheckSuccess: string
    updateCheckError: string
  }
}

interface UsersLang {
  header: string
  createButton: string
  saveButton: string
  cancelButton: string
  namePlaceholder: string
  deleteUser: {
    deleteUserTitle
    deleteUserMessage: string
    confirmDeleteButton: string
    cancelDeleteButton: string
  }
}

interface Lang {
  General: GenerlLang
  Dashboard: DashboardLang
  DownloadComic: DownloadComicLang
  HomeNav: HomeNavLang
  SearchComic: SearchComicLang
  Settings: SettingsLang
  Users: UsersLang
  Pagination: PaginationLang
}

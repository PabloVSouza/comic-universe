export default class enUS implements Lang {
  General: GenerlLang = {
    inDevelopment: 'Function in development',
    alertConfirmButton: 'Ok'
  }

  Dashboard: DashboardLang = {
    setComplete: 'Mark as Read',
    resetProgress: 'Mark as Unread',
    read: 'Read',
    continueReading: 'Continue Reading',
    downloadMore: 'Download More',
    newChapter: {
      noNewChapterMessage: 'We could not find new chapters',
      noNewChapterConfirm: 'Ok'
    },
    contextMenu: {
      deleteComic: {
        title: 'Do you really want to delete?',
        confirmMessage: 'All the read progress will be lost!',
        confirmOk: 'Confirm',
        confirmCancel: 'Cancel'
      }
    }
  }

  DownloadComic: DownloadComicLang = {
    chaptersTitle: 'Chapters',
    navigation: {
      downloadQueue: 'On Queue',
      downloadButton: 'Download Now',
      addToQueue: 'Add all to Queue',
      removeFromQueue: 'Remove all from Queue'
    }
  }

  HomeNav: HomeNavLang = {
    about: 'About This App',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    changeUser: 'Change User',
    closeApp: 'Fechar App'
  }

  SearchComic: SearchComicLang = {
    windowTitle: 'Search Comics',
    textPlaceholder: 'Type your Search',
    bookmarkComic: 'Bookmark',
    alreadyBookmarked: 'Bookmarked',
    availableChapters: 'Chapters Available',
    noReposAvailable: 'No Repos Available'
  }

  Pagination: PaginationLang = {
    previous: 'Previous',
    next: 'Next'
  }

  Settings: SettingsLang = {
    windowTitle: 'Application Settings',
    options: {
      generalLabel: 'General',
      pluginsLabel: 'Plugins',
      userLabel: 'Users'
    },
    general: {
      updatePreferences: 'Update Preferences',
      autoUpdate: 'Enable Auto-Update',
      checkForUpdates: 'Check for Updates',
      currentVersion: 'Current Version',
      releaseTypes: 'Release Types to Check',
      stableReleases: 'Stable Releases',
      betaReleases: 'Beta Releases',
      alphaReleases: 'Alpha Releases',
      nightlyReleases: 'Nightly Releases',
      optInNonStable: 'Opt-in for Non-Stable Updates',
      optInDescription: 'Allow the app to check for and install beta, alpha, and nightly releases',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully',
      updateCheckSuccess: 'Update check completed',
      updateCheckError: 'Error checking for updates'
    }
  }

  Users: UsersLang = {
    header: 'Select Your User',
    createButton: 'Create new User',
    saveButton: 'Save Info',
    cancelButton: 'Cancel',
    namePlaceholder: 'User Name',
    deleteUser: {
      deleteUserTitle: 'Delete this User?',
      deleteUserMessage: 'All the read progress will be lost!',
      confirmDeleteButton: 'Yes',
      cancelDeleteButton: 'No'
    }
  }
}

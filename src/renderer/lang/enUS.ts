export default class enUS implements Lang {
  Dashboard: DashboardLang = {
    setComplete: 'Mark as Read',
    resetProgress: 'Mark as Unread',
    read: 'Read',
    continueReading: 'Continue Reading',
    downloadMore: 'Download More'
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

  RightNav: RightNavLang = {
    about: 'About This App',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    changeUser: 'Change User'
  }

  SearchComic: SearchComicLang = {
    textPlaceholder: 'Type your Search',
    bookmarkComic: 'Add to List',
    availableChapters: 'Chapters Available',
    pagination: {
      previous: 'Previous',
      next: 'Next'
    }
  }

  Settings: SettingsLang = {
    title: 'App Settings',
    pages: {
      header: 'Troca de páginas',
      pageDirectionOptions: {
        leftToRight: 'Esquerda para Direita',
        rightToLeft: 'Direita para Esquerda'
      }
    },
    wallpaper: {
      header: 'Selecione o Papel de Parede',
      wallpaperMode: 'Modo do Papel de Parede',
      uploadWallpaper: 'Envie um Papel de Parede'
    },
    selectLanguage: 'Selecione o Idioma do App'
  }

  Users: UsersLang = {
    header: 'Select Your User',
    createButton: 'Create new User',
    saveButton: 'Save Info',
    cancelButton: 'Cancel',
    namePlaceholder: 'User Name'
  }
}

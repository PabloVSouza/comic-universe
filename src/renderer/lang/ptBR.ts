export default class ptBR implements Lang {
  General: GenerlLang = {
    inDevelopment: 'Função em desenvolvimento'
  }

  Dashboard: DashboardLang = {
    setComplete: 'Definir como Lido',
    resetProgress: 'Remover Progresso',
    read: 'Lido',
    continueReading: 'Continuar de onde Parou',
    downloadMore: 'Baixar mais Capítulos'
  }

  DownloadComic: DownloadComicLang = {
    chaptersTitle: 'Capítulos',
    navigation: {
      downloadQueue: 'Na fila',
      downloadButton: 'Baixar agora',
      addToQueue: 'Adicionar todos na fila',
      removeFromQueue: 'Remover todos da fila'
    }
  }

  RightNav: RightNavLang = {
    about: 'Sobre este App',
    settings: 'Configurações',
    darkMode: 'Modo Noturno',
    changeUser: 'Trocar de Usuário'
  }

  SearchComic: SearchComicLang = {
    textPlaceholder: 'Digite sua Busca',
    bookmarkComic: 'Favoritar',
    alreadyBookmarked: 'Favoritado',
    availableChapters: 'Capítulos Disponíveis',
    pagination: {
      previous: 'Anterior',
      next: 'Próxima'
    }
  }

  Settings: SettingsLang = {
    title: 'Configurações',
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
    header: 'Selecione o seu Usuário',
    createButton: 'Criar Usuário',
    saveButton: 'Salvar Usuário',
    cancelButton: 'Cancelar',
    namePlaceholder: 'Nome do Usuário'
  }
}

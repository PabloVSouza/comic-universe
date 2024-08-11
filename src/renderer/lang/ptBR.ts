export default class ptBR implements Lang {
  General: GenerlLang = {
    inDevelopment: 'Função em desenvolvimento'
  }

  Dashboard: DashboardLang = {
    setComplete: 'Definir como Lido',
    resetProgress: 'Remover Progresso',
    read: 'Lido',
    continueReading: 'Continuar de onde Parou',
    downloadMore: 'Baixar mais Capítulos',
    newChapter: {
      noNewChapterMessage: 'Não existem novos capítulos',
      noNewChapterConfirm: 'Ok'
    },
    contextMenu: {
      deleteComic: {
        title: 'Apagar Quadrinho',
        confirmMessage: 'Deseja mesmo apagar? (Todo o progresso de leitura será apagado!)',
        confirmOk: 'Confirmar',
        confirmCancel: 'Cancelar'
      }
    }
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

  HomeNav: HomeNavLang = {
    about: 'Sobre este App',
    settings: 'Configurações',
    darkMode: 'Modo Noturno',
    changeUser: 'Trocar de Usuário',
    closeApp: 'Fechar App'
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
    windowTitle: 'Configurações',
    options: {
      generalLabel: 'Geral',
      pluginsLabel: 'Plugins',
      userLabel: 'Usuário'
    }
  }

  Users: UsersLang = {
    header: 'Selecione o seu Usuário',
    createButton: 'Criar Usuário',
    saveButton: 'Salvar Usuário',
    cancelButton: 'Cancelar',
    namePlaceholder: 'Nome do Usuário',
    deleteUser: {
      deleteUserTitle: 'Apagar este usuário?',
      deleteUserMessage: 'Todo o progresso de leitura será perdido!',
      confirmDeleteButton: 'Sim',
      cancelDeleteButton: 'Não'
    }
  }
}

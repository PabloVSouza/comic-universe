type IDBMethods = {
  //Comics
  dbGetComic: (input: { id: number }) => Promise<IComic>
  dbGetComicAdditionalData: (input: { id: number; userId: number }) => Promise<IComic>
  dbGetAllComics: () => Promise<IComic[]>
  dbInsertComic: (input: { comic: IComic; chapters: IChapter[]; repo: string }) => Promise<void>
  dbDeleteComic: (input: { comic: IComic }) => Promise<void>

  //Chapters
  dbGetAllChaptersNoPage: () => Promise<IChapter[]>
  dbGetChapters: (input: { comicId: number }) => Promise<IChapter[]>
  dbInsertChapters: (input: { chapters: IChapter[] }) => Promise<void>
  dbUpdateChapter: (input: { chapter: IChapter }) => Promise<IChapter>

  //Read Progress
  dbGetReadProgress: (input: { search: string }) => Promise<IReadProgress[]>
  dbUpdateReadProgress: (input: { readProgress: IReadProgress }) => Promise<void>

  //Users
  dbGetAllUsers: () => Promise<IUser[]>
  dbUpdateUser: (input: { user: IUser }) => Promise<IUser>
  dbDeleteUser: (input: { id: number }) => Promise<void>

  dbRunMigrations: () => Promise<void>
  dbVerifyMigrations: () => Promise<boolean>
}

interface IDBRepository {
  methods: IDBMethods
}

interface IDBInteractionsRepositoryInit {
  path: string
}
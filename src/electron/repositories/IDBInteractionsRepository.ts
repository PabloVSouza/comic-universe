import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  //Comics
  dbGetComic: (input: { id: number }) => Promise<ComicInterface>
  dbGetComicComplete: (input: { id: number }) => Promise<ComicInterface>
  dbGetAllComics: () => Promise<ComicInterface[]>
  dbInsertComic: (input: {
    comic: ComicInterface
    chapters: ChapterInterface[]
    repo: string
  }) => Promise<void>

  //Chapters
  dbGetAllChaptersNoPage: () => Promise<ChapterInterface[]>
  dbGetChapters: (input: { comicId: number }) => Promise<ChapterInterface[]>
  dbInsertChapter: (input: { comicId: number; chapter: ChapterInterface }) => Promise<void>
  dbUpdateChapter: (input: { chapter: ChapterInterface }) => Promise<ChapterInterface>

  //Read Progress
  dbGetReadProgress: (input: { search: string }) => Promise<ReadProgressInterface[]>
  dbUpdateReadProgress: (input: { readProgress: ReadProgressInterface }) => Promise<void>

  //Users
  dbGetAllUsers: () => Promise<UserInterface[]>
  dbUpdatecUser: (input: { user: UserInterface }) => Promise<UserInterface>
  dbDeleteUser: (input: { id: number }) => Promise<void>
}

export interface IDBInteractionsRepository {
  methods: IDBInteractionsMethods
}

export interface IDBInteractionsRepositoryInit {
  path: string
  win: BrowserWindow
}

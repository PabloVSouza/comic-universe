import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  dbGetComic: (input: { id: string }) => Promise<Comic> | null
  dbGetAllComics: () => Promise<Comic[]>
  dbGetChapters: (input: { comicId: string }) => Promise<Chapter[]>
  dbInsertComic: (input: {
    comic: Comic
    chapter: Chapter
  }) => Promise<{ comic: Comic; chapter: Chapter }>
  dbGetReadProgress: (input: { search: string }) => Promise<ReadProgress[]>
  dbUpdateReadProgress: (input: {
    comicId: string
    chapter: Chapter
    page: number
  }) => Promise<void>
}

export interface IDBInteractionsRepository {
  methods: IDBInteractionsMethods
}

export interface IDBInteractionsRepositoryInit {
  path: string
  win: BrowserWindow
}

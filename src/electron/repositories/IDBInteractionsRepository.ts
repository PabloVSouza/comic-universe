import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  dbGetComic: (input: { id: number }) => Promise<Comic> | null
  dbGetAllComics: () => Promise<Comic[]>
  dbGetChapters: (input: { comicId: number }) => Promise<Chapter[]>
  dbInsertComic: (input: { comic: Comic; chapters: Chapter[] }) => Promise<void>
  dbInsertChapter: (input: { comicId: string; chapter: Chapter }) => Promise<void>
  dbGetReadProgress: (input: { search: String }) => Promise<ReadProgress[]>
  dbUpdateReadProgress: (input: {
    comicId: number
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

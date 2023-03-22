import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  dbGetComic: (id: string) => Promise<Comic> | null
  dbGetAllComics: () => Promise<Comic[]>
  dbGetChapters: (comicId: string) => Promise<Chapter[]>
  dbInsertComic: (comic: Comic, chapter: Chapter) => Promise<{ comic: Comic; chapter: Chapter }>
  dbGetReadProgress: (search: string) => Promise<ReadProgress>
  dbUpdateReadProgress: (comicId: string, chapter: Chapter, page: number) => Promise<void>
}

export interface IDBInteractionsRepository {
  methods: IDBInteractionsMethods
}

export interface IDBInteractionsRepositoryInit {
  path: string
  win: BrowserWindow
}

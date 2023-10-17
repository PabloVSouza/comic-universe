import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  dbGetComic: (input: { id: number }) => Promise<ComicInterface> | null
  dbGetAllComics: () => Promise<ComicInterface[]>
  dbGetChapters: (input: { comicId: number }) => Promise<ChapterInterface[]>
  dbInsertComic: (input: { comic: ComicInterface; chapters: ChapterInterface[] }) => Promise<void>
  dbInsertChapter: (input: { comicId: number; chapter: ChapterInterface }) => Promise<void>
  dbGetReadProgress: (input: { search: string }) => Promise<ReadProgressInterface[]>
  dbUpdateReadProgress: (input: {
    comicId: number
    userId: number
    chapter: ChapterInterface
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

import { BrowserWindow } from 'electron'

export type IDBInteractionsMethods = {
  dbGetComic: (input: { id: number }) => Promise<ComicInterface>
  dbGetComicComplete: (input: { id: number }) => Promise<ComicInterface>
  dbGetAllComics: () => Promise<ComicInterface[]>
  dbGetAllChaptersNoPage: () => Promise<ChapterInterface[]>
  dbGetChapters: (input: { comicId: number }) => Promise<ChapterInterface[]>
  dbInsertComic: (input: {
    comic: ComicInterface
    chapters: ChapterInterface[]
    repo: string
  }) => Promise<void>
  dbInsertChapter: (input: { comicId: number; chapter: ChapterInterface }) => Promise<void>
  dbUpdateChapter: (input: { chapter: ChapterInterface }) => Promise<ChapterInterface>
  dbGetReadProgress: (input: { search: string }) => Promise<ReadProgressInterface[]>
  dbUpdateReadProgress: (input: { readProgress: ReadProgressInterface }) => Promise<void>
}

export interface IDBInteractionsRepository {
  methods: IDBInteractionsMethods
}

export interface IDBInteractionsRepositoryInit {
  path: string
  win: BrowserWindow
}

export interface IDBInteractionsRepository {
  dbGetComic(id: string): Promise<Comic>
  dbGetAllComics(): Promise<Comic[]>
  dbGetChapters(comicId: string): Promise<Chapter[]>
  dbInsertComic(comic: Comic, chapter: Chapter): Promise<{ comic: Comic; chapter: Chapter }>
  dbGetReadProgress(chapterId: string): Promise<ReadProgress>
  dbUpdateReadProgress(comicId: string, chapter: Chapter, page: number): Promise<void>
}

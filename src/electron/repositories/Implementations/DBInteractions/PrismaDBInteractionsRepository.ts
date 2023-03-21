import { IDBInteractionsRepository } from '../../IDBInteractionsRepository'

export class PrismaDBInteractionsRepository implements IDBInteractionsRepository {
  async dbGetComic(id: string): Promise<Comic> {
    return {} as Comic
  }

  async dbGetAllComics(): Promise<Comic[]> {
    return []
  }

  async dbGetChapters(comicId: string): Promise<Chapter[]> {
    return []
  }

  async dbInsertComic(comic: Comic, chapter: Chapter): Promise<{ comic: Comic; chapter: Chapter }> {
    return { comic: {} as Comic, chapter: {} as Chapter }
  }

  async dbGetReadProgress(chapterId: string): Promise<ReadProgress> {
    return {} as ReadProgress
  }

  async dbUpdateReadProgress(comicId: string, chapter: Chapter, page: number): Promise<void> {
    return
  }
}

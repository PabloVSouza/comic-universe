export interface IFetchComicRepository {
  url: string
  directory: string
  getList(): Promise<Comic[]>
  getDetails(id: string): Promise<Partial<Comic>>
  getChapters(id: string): Promise<Chapter[]>
  getPages?(chapter: Chapter): Promise<string[]>
  downloadChapter(comic: Comic, chapter: Chapter): Promise<{ cover: string; pageFiles: string[] }>
}

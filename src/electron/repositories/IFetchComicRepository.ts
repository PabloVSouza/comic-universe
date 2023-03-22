import { BrowserWindow } from 'electron'

export interface IFetchComicMethods {
  getList(): Promise<Comic[]>
  getDetails(id: string): Promise<Partial<Comic>>
  getChapters(id: string): Promise<Chapter[]>
  getPages?(chapter: Chapter): Promise<string[]>
  downloadChapter(comic: Comic, chapter: Chapter): Promise<{ cover: string; pageFiles: string[] }>
}

export interface IFetchComicRepository {
  methods: IFetchComicMethods
}

export interface IFetchComicRepositoryInit {
  path: string
  url: string
  win: BrowserWindow
}

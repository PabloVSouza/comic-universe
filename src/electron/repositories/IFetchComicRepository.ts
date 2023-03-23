import { BrowserWindow } from 'electron'

export interface IFetchComicMethods {
  getList(): Promise<Comic[]>
  search(input: { search: string }): Promise<Comic[]>
  getDetails(input: { id: string }): Promise<Partial<Comic>>
  getChapters(input: { id: string }): Promise<Chapter[]>
  getPages?(input: { chapter: Chapter }): Promise<string[]>
  downloadChapter(input: {
    comic: Comic
    chapter: Chapter
  }): Promise<{ cover: string; pageFiles: string[] }>
}

export interface IFetchComicRepository {
  methods: IFetchComicMethods
}

export interface IFetchComicRepositoryInit {
  path: string
  url: string
  win: BrowserWindow
}

import { BrowserWindow } from 'electron'

export interface IFetchComicMethods {
  getList(): Promise<Comic[]>
  search(input: { search: string }): Promise<Comic[]>
  getDetails(search: { [key: string]: string }): Promise<Partial<Comic>>
  getChapters(input: { siteId: string }): Promise<Chapter[]>
  getPages?(input: { chapterLink: string }): Promise<Page[]>
  downloadChapter(input: {
    comic: Comic
    chapter: Chapter
  }): Promise<{ cover: string; pageFiles: Page[] }>
}

export interface IFetchComicRepository {
  methods: IFetchComicMethods
}

export interface IFetchComicRepositoryInit {
  path: string
  url: string
  win: BrowserWindow
}

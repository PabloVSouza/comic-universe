import { BrowserWindow } from 'electron'

export interface IFetchComicMethods {
  getList(): Promise<ComicInterface[]>
  search(input: { search: string }): Promise<ComicInterface[]>
  getDetails(search: { [key: string]: string }): Promise<Partial<ComicInterface>>
  getChapters(input: { siteId: string }): Promise<ChapterInterface[]>
  getPages?(input: { chapterLink: string }): Promise<Page[]>
  downloadChapter?(input: {
    comic: ComicInterface
    chapter: ChapterInterface
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

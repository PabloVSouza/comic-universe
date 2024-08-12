interface IRepoPluginMethods {
  getList(): Promise<ComicInterface[]>
  search(input: { search: string }): Promise<ComicInterface[]>
  getDetails(search: { [key: string]: string }): Promise<Partial<ComicInterface>>
  getChapters(input: { siteId: string }): Promise<ChapterInterface[]>
  getPages?(input: { siteLink: string }): Promise<Page[]>
  downloadChapter?(input: {
    comic: ComicInterface
    chapter: ChapterInterface
  }): Promise<{ cover: string; pageFiles: Page[] }>
}

interface IRepoPluginRepository {
  RepoName: string
  RepoUrl: string
  RepoTag: string
  methods: IRepoPluginMethods
}

interface IRepoPluginRepositoryConstruct {
  new (): IRepoPluginRepository
}

interface IRepoPluginRepositoryInit {
  path: string
  url: string
}

interface IRepoPluginInfo {
  name: string
  author: string
  repository: string
  path: string
  iconPath: string
  version: string
}

interface IRepoApiPluginList {
  name: string
  repo: string
  tag: string
}

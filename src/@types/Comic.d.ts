interface IComic {
  id?: number
  siteId: string
  name: string
  cover: string
  repo: string
  author?: string | null
  artist?: string | null
  publisher?: string | null
  status?: string | null
  genres?: string | null
  siteLink?: string | null
  synopsis: string
  year?: string | null
  type: 'hq' | 'manga' | 'manhwa' | 'manhua'
  readingMode?: 'horizontal' | 'vertical'
  chapters?: IChapter[]
}

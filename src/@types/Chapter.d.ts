interface IChapter {
  id?: number
  comicId?: number
  siteId: string
  siteLink?: string | null
  releaseId?: string | null
  name?: string | null
  number: string
  pages?: string | null
  date?: string | null
  repo: string
  language?: string | null
  offline?: boolean
  Comic?: IComic
  ReadProgress?: IReadProgress[]
}

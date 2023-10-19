interface ChapterInterface {
  id: number
  comicId: number
  siteId: string
  siteLink?: string | null
  releaseId?: string | null
  name: string
  number: string
  pages: string
  date: string
  repo: string
  offline: boolean
  Comic: Comic
  ReadProgress: ReadProgress[]
}

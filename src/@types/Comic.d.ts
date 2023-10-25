interface ComicInterface {
  id: number
  siteId: string
  name: string
  cover: string
  repo: string
  author?: string | null
  artist?: string | null
  publisher?: string | null
  status?: string | null
  genres?: string | null
  siteLink: string
  synopsis: string
  year?: string
  type: string
  chapters: Chapter[]
  ReadProgress: ReadProgress[]
}

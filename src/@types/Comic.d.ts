interface Comic {
  siteId: string
  name: string
  chapters?: Chapter[]
  cover: string
  repo: string
  author?: string
  publisher?: string
  status?: string
  genres?: string[]
  synopsis: string
  type: string
  _id: string
  createdAt: {
    $$date: number
  }
}

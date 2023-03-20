interface Comic {
  id: string
  name: string
  chapters?: Chapter[]
  cover: string
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

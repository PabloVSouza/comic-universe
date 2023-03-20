interface Chapter {
  comicId: string
  id: string
  name: string
  number: string
  pages: string[]
  date?: string
  _id: string
  createdAt: {
    $$date: number
  }
}

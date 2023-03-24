interface Chapter {
  comicId: string
  siteId: string
  name?: string
  number: string
  pages: Page[]
  date?: string
  _id: string
  createdAt: {
    $$date: number
  }
}

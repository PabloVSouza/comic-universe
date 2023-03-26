interface Chapter {
  comicId: string
  siteId: string
  name?: string
  number: string
  pages: Page[]
  date?: string
  offline: boolean
  _id: string
  createdAt: {
    $$date: number
  }
}

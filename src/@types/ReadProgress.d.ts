interface ReadProgress {
  comicId: string
  chapterId: string
  totalPages: number
  page: number
  _id: string
  createdAt: {
    $$date: number
  }
}

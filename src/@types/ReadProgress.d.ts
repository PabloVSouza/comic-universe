interface IReadProgress {
  id?: string
  chapterId: string
  comicId: string
  userId: string
  totalPages: number
  page: number
  updatedAt?: string
  Chapter?: Chapter
  User?: User
  Comic?: Comic
}

interface ReadProgressInterface {
  id?: number
  chapterId: number
  comicId: number
  userId: number
  totalPages: number
  page: number
  Chapter?: Chapter
  User?: User
  Comic?: Comic
}

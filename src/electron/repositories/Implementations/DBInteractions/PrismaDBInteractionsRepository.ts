import { IDBInteractionsMethods, IDBInteractionsRepository } from '../../IDBInteractionsRepository'

export class PrismaDBInteractionsRepository implements IDBInteractionsRepository {
  methods: IDBInteractionsMethods = {
    async dbGetComic(id) {
      return {} as Comic
    },
    async dbGetAllComics() {
      return [] as Comic[]
    },
    async dbGetChapters(comicId) {
      return [] as Chapter[]
    },
    async dbInsertComic(comic, chapter) {
      return { comic: {} as Comic, chapter: {} as Chapter }
    },
    async dbGetReadProgress(chapterId) {
      return {} as ReadProgress
    },
    async dbUpdateReadProgress(comicId, chapter, page) {
      return
    }
  }
}

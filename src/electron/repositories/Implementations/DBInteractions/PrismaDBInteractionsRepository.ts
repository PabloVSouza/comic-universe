import { IDBInteractionsMethods, IDBInteractionsRepository } from '../../IDBInteractionsRepository'

export class PrismaDBInteractionsRepository implements IDBInteractionsRepository {
  methods: IDBInteractionsMethods = {
    dbGetComic: async ({ id }) => {
      return {} as Comic
    },
    dbGetAllComics: async () => {
      return [] as Comic[]
    },
    dbGetChapters: async ({ comicId }) => {
      return [] as Chapter[]
    },
    dbInsertComic: async ({ comic, chapter }) => {
      return { comic, chapter }
    },
    dbGetReadProgress: async ({ search }): Promise<ReadProgress[]> => {
      return {} as ReadProgress[]
    },
    dbUpdateReadProgress: async ({ comicId, chapter, page }): Promise<void> => {
      const obj = {
        comicId,
        chapter,
        page
      }
      return
    }
  }
}

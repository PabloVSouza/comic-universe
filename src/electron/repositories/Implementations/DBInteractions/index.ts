import {
  IDBInteractionsRepository,
  IDBInteractionsRepositoryInit
} from '../../IDBInteractionsRepository'
import { PrismaDBInteractionsRepository } from './PrismaDBInteractionRepository'

interface Repos {
  [key: string]: new (data: IDBInteractionsRepositoryInit) => IDBInteractionsRepository
}

export class DBInteractionsRepository {
  private Repos: Repos = {
    prisma: PrismaDBInteractionsRepository
  }

  public repo: IDBInteractionsRepository

  constructor(repo: string, data: IDBInteractionsRepositoryInit) {
    this.repo = new this.Repos[repo](data)
  }
}

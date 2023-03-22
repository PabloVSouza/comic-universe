import {
  IDBInteractionsRepository,
  IDBInteractionsRepositoryInit
} from '../../IDBInteractionsRepository'
import { NeDBDBInteractionsRepository } from './NeDBDBInteractionsRepository'

interface Repos {
  [key: string]: new (data: IDBInteractionsRepositoryInit) => IDBInteractionsRepository
}

export class DBInteractionsRepository {
  private Repos: Repos = {
    nedb: NeDBDBInteractionsRepository
  }

  public repo: IDBInteractionsRepository

  constructor(repo: string, data: IDBInteractionsRepositoryInit) {
    this.repo = new this.Repos[repo](data)
  }
}

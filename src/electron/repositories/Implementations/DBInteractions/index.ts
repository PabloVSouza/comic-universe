import { BrowserWindow } from 'electron'
import { IDBInteractionsRepository } from '../../IDBInteractionsRepository'
import { NeDBDBInteractionsRepository } from './NeDBDBInteractionsRepository'

interface Repos {
  [key: string]: new (path: string, win: BrowserWindow) => IDBInteractionsRepository
}

export class DBRepository {
  private Repos: Repos = {
    nedb: NeDBDBInteractionsRepository
  }

  public repo: IDBInteractionsRepository

  constructor(repo: string, path: string, win: BrowserWindow) {
    this.repo = new this.Repos[repo](path, win)
  }
}

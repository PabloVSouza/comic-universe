import { BrowserWindow } from 'electron'
import { IFetchComicRepository } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'

interface Repos {
  [key: string]: new (directory: string, url: string, win: BrowserWindow) => IFetchComicRepository
}

export class FetchComicRepository {
  private Repos: Repos = {
    hqnow: HQNowFetchComicRepository
  }

  public repo: IFetchComicRepository

  constructor(repo: string, directory: string, url: string, win: BrowserWindow) {
    this.repo = new this.Repos[repo](directory, url, win)
  }
}

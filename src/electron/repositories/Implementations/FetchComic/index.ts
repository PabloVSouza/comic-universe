import { IFetchComicRepository, IFetchComicRepositoryInit } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'

interface Repos {
  [key: string]: new (data: IFetchComicRepositoryInit) => IFetchComicRepository
}

export class FetchComicRepository {
  private Repos: Repos = {
    hqnow: HQNowFetchComicRepository
  }

  public repo: IFetchComicRepository

  constructor(repo: string, data: IFetchComicRepositoryInit) {
    this.repo = new this.Repos[repo](data)
  }
}

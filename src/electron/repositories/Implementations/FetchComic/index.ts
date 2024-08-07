import { IFetchComicRepository, IFetchComicRepositoryInit } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'

interface Repos {
  [key: string]: new (data: IFetchComicRepositoryInit) => IFetchComicRepository
}

const FetchComicRepository = (
  repo: string,
  data: IFetchComicRepositoryInit
): IFetchComicRepository => {
  const repos: Repos = {
    hqnow: HQNowFetchComicRepository
  }

  return new repos[repo](data)
}

export default FetchComicRepository

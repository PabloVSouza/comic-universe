import { IFetchComicRepository, IFetchComicRepositoryInit } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'
import { FireMangasFetchComicRepository } from './FireMangasFetchComicRepository'
import { MangaLivreFetchComicRepository } from './MangaLivreFetchComicRepository'

interface Repos {
  [key: string]: new (data: IFetchComicRepositoryInit) => IFetchComicRepository
}

const FetchComicRepository = (
  repo: string,
  data: IFetchComicRepositoryInit
): IFetchComicRepository => {
  const repos: Repos = {
    hqnow: HQNowFetchComicRepository,
    firemangas: FireMangasFetchComicRepository,
    mangalivre: MangaLivreFetchComicRepository
  }

  return new repos[repo](data)
}

export default FetchComicRepository

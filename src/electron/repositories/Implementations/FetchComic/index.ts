import { IFetchComicRepository, IFetchComicRepositoryInit } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'
import { MangaLivreFetchComicRepository } from './MangaLivreFetchComicRepository'
import { LerMangaFetchComicRepository } from './LerMangaFetchComicRepository'

interface Repos {
  [key: string]: new (data: IFetchComicRepositoryInit) => IFetchComicRepository
}

const FetchComicRepository = (
  repo: string,
  data: IFetchComicRepositoryInit
): IFetchComicRepository => {
  const repos: Repos = {
    hqnow: HQNowFetchComicRepository,
    mangalivre: MangaLivreFetchComicRepository,
    lermanga: LerMangaFetchComicRepository
  }

  return new repos[repo](data)
}

export default FetchComicRepository

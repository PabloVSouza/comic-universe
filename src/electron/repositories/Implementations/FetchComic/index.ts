import { IFetchComicRepository, IFetchComicRepositoryInit } from '../../IFetchComicRepository'

import { HQNowFetchComicRepository } from './HQNowFetchComicRepository'
import { LerMangaFetchComicRepository } from './LerMangaFetchComicRepository'
import { MangaDexFetchComicRepository } from './MangaDexFetchComicRepository'

interface Repos {
  [key: string]: new (data: IFetchComicRepositoryInit) => IFetchComicRepository
}

const FetchComicRepository = (
  repo: string,
  data: IFetchComicRepositoryInit
): IFetchComicRepository => {
  const repos: Repos = {
    hqnow: HQNowFetchComicRepository,
    lermanga: LerMangaFetchComicRepository,
    mangadex: MangaDexFetchComicRepository
  }

  return new repos[repo](data)
}

export default FetchComicRepository

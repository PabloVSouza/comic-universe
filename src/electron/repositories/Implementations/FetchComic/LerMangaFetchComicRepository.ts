import { WebContents } from 'electron'
// import slugify from 'slugify'
import axios from 'axios'
import qs from 'qs'
import * as cheerio from 'cheerio'

import {
  IFetchComicMethods,
  IFetchComicRepository,
  IFetchComicRepositoryInit
} from '../../IFetchComicRepository'

// import CreateDirectory from '../../../utils/CreateDirectory'
// import DownloadFile from '../../../utils/DownloadFile'

export class LerMangaFetchComicRepository implements IFetchComicRepository {
  ipc: WebContents
  path: string
  url: string

  constructor(data: IFetchComicRepositoryInit) {
    this.ipc = data.win.webContents
    this.path = data.path
    this.url = data.url
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<ComicInterface[]> => {
      const searchString = qs.stringify({
        action: 'wp-manga-search-manga',
        title: 'A'
      })

      const { data } = await axios({
        method: 'get',
        url: `${this.url}/wp-admin/admin-ajax.php?${searchString}`,
        headers: {
          'content-type': 'application/json, text/javascript, */*; q=0.01',
          'x-requested-with': 'XMLHttpRequest'
        }
      })

      const res = data.data.slice(1).reduce((previousComic, comic) => {
        return [
          ...previousComic,
          {
            siteId: comic.url,
            name: comic.title,
            cover: comic.thumb,
            siteLink: comic.url,
            type: 'manga'
          }
        ]
      }, [])

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    search: async ({ search }): Promise<ComicInterface[]> => {
      const searchString = qs.stringify({
        action: 'wp-manga-search-manga',
        title: search
      })

      const { data } = await axios({
        method: 'get',
        url: `${this.url}/wp-admin/admin-ajax.php?${searchString}`,
        headers: {
          'content-type': 'application/json, text/javascript, */*; q=0.01',
          'x-requested-with': 'XMLHttpRequest'
        }
      })

      const res = data.data.slice(1).reduce((previousComic, comic) => {
        return [
          ...previousComic,
          {
            siteId: comic.url,
            name: comic.title,
            cover: comic.thumb,
            siteLink: comic.url,
            type: 'manga'
          }
        ]
      }, [])

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getDetails: async (search): Promise<Partial<ComicInterface>> => {
      const { siteLink } = search

      const { data } = await axios.get(siteLink)

      const parsedData = cheerio.load(data)

      const synopsisRaw = parsedData('.boxAnimeSobreLast p').html()
      const synopsis = synopsisRaw?.substring(synopsisRaw.indexOf(':') + 1)

      const genres = JSON.stringify(
        parsedData('.genre-list li')
          .map((_i, item) => parsedData(item).find('a').html()?.trim())
          .toArray()
      )

      const res = {
        synopsis,
        genres,
        type: 'manga'
      } as Partial<ComicInterface>

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getChapters: async ({ siteId }): Promise<ChapterInterface[]> => {
      const { data } = await axios.get(siteId)

      const parsedData = cheerio.load(data)

      const chaptersList = parsedData('.single-chapter')
        .map(
          (_id, val) =>
            ({
              siteId: parsedData(val).prop('data-id-cap'),
              number: parsedData(val).prop('data-id-cap'),
              siteLink: parsedData(val).find('a').prop('href'),
              date: parsedData(val).find('small').children('small').text()
            } as ChapterInterface)
        )
        .toArray()

      return new Promise((resolve) => {
        resolve(chaptersList.reverse())
      })
    },

    getPages: async ({ siteLink }) => {
      const fetchPage = await axios.get(siteLink)
      const parsedPage = cheerio.load(fetchPage.data)
      const pagesRawBase64 = parsedPage('.heading-header').next().prop('src')
      let pages = [] as string[]
      if (pagesRawBase64) {
        const base64String = pagesRawBase64.substring(pagesRawBase64.indexOf(',') + 1)
        const pagesRaw = Buffer.from(base64String, 'base64').toString()
        pages = JSON.parse(pagesRaw.substring(pagesRaw.indexOf('[')))
      }

      const formattedPages = pages.map((page) => {
        const filename = page.substring(page.lastIndexOf('/') + 1)
        const path = page

        return { filename, path }
      })

      return formattedPages
    }
  }
}

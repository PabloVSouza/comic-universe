import { WebContents } from 'electron'
// import slugify from 'slugify'
import axios, { Axios } from 'axios'
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
  axios: Axios

  constructor(data: IFetchComicRepositoryInit) {
    this.ipc = data.win.webContents
    this.path = data.path
    this.url = data.url
    this.axios = new Axios({
      baseURL: this.url,
      timeout: 15000,
      headers: {
        'content-type': 'application/json, text/javascript, */*; q=0.01',
        'x-requested-with': 'XMLHttpRequest'
      }
    })
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<ComicInterface[]> => this.methods.search({ search: 'A' }),

    search: async ({ search }): Promise<ComicInterface[]> => {
      const searchString = qs.stringify({
        s: search
      })

      let res: ComicInterface[]

      try {
        const { data } = await this.axios.get(`${this.url}/?${searchString}`)

        const parsedData = cheerio.load(data)

        const resultElements = parsedData('.flw-item')

        const list = resultElements
          .map((_id, val) => {
            const comicData = parsedData(val).children('.film-poster')

            const name = parsedData(val).find('.film-name').children('a').contents().toString()
            const siteId = comicData.find('.film-poster-ahref').prop('href')
            const siteLink = siteId
            const cover = comicData.find('.film-poster-img').prop('src')
            const type = 'manga'

            return {
              name,
              siteId,
              siteLink,
              cover,
              type
            }
          })
          .toArray()

        res = list as ComicInterface[]
      } catch (e) {
        console.log(e)
        res = []
      }

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getDetails: async (search): Promise<Partial<ComicInterface>> => {
      const { siteLink } = search

      const { data } = await this.axios.get(siteLink)

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
            }) as ChapterInterface
        )
        .toArray()

      return new Promise((resolve) => {
        resolve(chaptersList.reverse())
      })
    },

    getPages: async ({ siteLink }) => {
      function base64Decrypt(data: string): string {
        const base64String = data.substring(data.indexOf(',') + 1)
        return Buffer.from(base64String, 'base64').toString()
      }

      let response: { filename: string; path: string }[]

      try {
        const fetchPage = await this.axios.get(siteLink)
        const parsedPage = cheerio.load(fetchPage.data)
        const pagesRawBase64 = parsedPage('.heading-header').next().prop('src')
        const pagesRaw =
          (pagesRawBase64
            ? base64Decrypt(pagesRawBase64)
            : parsedPage('.heading-header').next().html()) ?? ''

        const pages = JSON.parse(
          pagesRaw.substring(pagesRaw.indexOf('['), pagesRaw.indexOf(']') + 1)
        ) as string[]

        response = pages.map((page) => {
          const filename = page.substring(page.lastIndexOf('/') + 1)
          const path = page

          return { filename, path }
        })
      } catch (e) {
        console.log(e)
        response = []
      }

      return new Promise((resolve) => {
        resolve(response)
      })
    }
  }
}

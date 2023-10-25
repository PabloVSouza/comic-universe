import { WebContents } from 'electron'
import axios, { Axios } from 'axios'
import qs from 'qs'
import * as cheerio from 'cheerio'

import {
  IFetchComicMethods,
  IFetchComicRepository,
  IFetchComicRepositoryInit
} from '../../IFetchComicRepository'

export class MangaDexFetchComicRepository implements IFetchComicRepository {
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
        'content-type': 'application/json'
      }
    })
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<ComicInterface[]> => this.methods.search({ search: '' }),

    search: async ({ search, language }): Promise<ComicInterface[]> => {
      const searchString = qs.stringify({
        title: search,
        includes: ['author', 'artist', 'cover_art']
      })

      let res: ComicInterface[]

      try {
        const { data } = await this.axios.get(`/manga?${searchString}`)

        const list = JSON.parse(data).data

        res = list.reduce((previousComic, comic) => {
          const { attributes } = comic

          const siteId = comic.id
          const type = comic.type
          const name = attributes.title.en
          const status = attributes.status
          const synopsis = attributes.description[language] ?? attributes.description.en

          const genres = JSON.stringify(
            attributes.tags.reduce((acc, cur) => {
              return [...acc, cur.attributes.name.en]
            }, [])
          )

          const details = comic.relationships
            .filter(
              (val) => val.type === 'author' || val.type === 'artist' || val.type === 'cover_art'
            )
            .reduce((acc, cur) => {
              const newObject = { ...acc }

              if (cur.type === 'author')
                newObject.author = newObject.author?.length
                  ? newObject.author + ', ' + cur.attributes.name
                  : cur.attributes.name

              if (cur.type === 'artist')
                newObject.artist = newObject.artist?.length
                  ? newObject.artist + ', ' + cur.attributes.name
                  : cur.attributes.name

              if (cur.type === 'cover_art') {
                newObject.cover =
                  'https://' +
                  this.url.substring(this.url.indexOf('.') + 1) +
                  '/covers/' +
                  siteId +
                  '/' +
                  cur.attributes.fileName +
                  '.512.jpg'
              }

              return newObject
            }, {})

          const comicData = [
            ...previousComic,
            {
              ...details,
              siteId,
              name,
              type,
              synopsis,
              status,
              genres
            }
          ]

          return comicData
        }, [])
      } catch (e) {
        console.log(e)
        res = []
      }

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getDetails: async (): Promise<Partial<ComicInterface>> => {
      const res = {} as Partial<ComicInterface>

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getChapters: async ({ siteId, language }): Promise<ChapterInterface[]> => {
      console.log(siteId)
      const searchString = qs.stringify({
        translatedLanguage: [language]
      })

      const { volumes } = JSON.parse(
        (await this.axios.get(`/manga/${siteId}/aggregate?${searchString}`)).data
      )

      const volumeNames = Object.keys(volumes)

      for (const key of volumeNames) {
        const chapterNames = Object.keys(volumes[key].chapters)
        console.log(chapterNames)
      }

      const chaptersList = [] as ChapterInterface

      return new Promise((resolve) => {
        resolve(chaptersList.reverse())
      })
    },

    getPages: async ({ siteLink }) => {
      //api.mangadex.org/at-home/server/b1f4656f-0c26-4bae-a436-a3b59f20eacc?forcePort443=false
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

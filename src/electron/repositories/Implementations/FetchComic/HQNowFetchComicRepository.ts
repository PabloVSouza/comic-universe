import { WebContents } from 'electron'
import slugify from 'slugify'
import { ApolloClient, gql, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import fetch from 'cross-fetch'

import {
  IFetchComicMethods,
  IFetchComicRepository,
  IFetchComicRepositoryInit
} from '../../IFetchComicRepository'
import CreateDirectory from '../../../utils/CreateDirectory'
import DownloadFile from '../../../utils/DownloadFile'

export class HQNowFetchComicRepository implements IFetchComicRepository {
  client: ApolloClient<NormalizedCacheObject>
  ipc: WebContents
  path: string

  constructor(data: IFetchComicRepositoryInit) {
    const cache: InMemoryCache = new InMemoryCache({})
    this.client = new ApolloClient({
      cache,
      link: new HttpLink({ uri: data.url, fetch })
    })
    this.ipc = data.win.webContents
    this.path = data.path
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<Comic[]> => {
      const { data } = await this.client.query({
        query: gql`
          query {
            getAllHqs {
              id
              name
              synopsis
              status
            }
          }
        `
      })

      return new Promise((resolve) => {
        resolve(data.getAllHqs as Comic[])
      })
    },

    getDetails: async ({ id }): Promise<Partial<Comic>> => {
      const { data } = await this.client.query({
        query: gql`
          query getHqsById($id: Int!) {
            getHqsById(id: $id) {
              cover: hqCover
              publisher: publisherName
              chapters: capitulos {
                name
                id
                number
                pages: pictures {
                  url: pictureUrl
                }
              }
            }
          }
        `,
        variables: { id: Number(id) }
      })

      const res = {
        ...data.getHqsById[0],
        totalChapters: data.getHqsById[0].chapters.length
      }

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getChapters: async ({ id }): Promise<Chapter[]> => {
      const { data } = await this.client.query({
        query: gql`
          query getHqsById($id: Int!) {
            getHqsById(id: $id) {
              chapters: capitulos {
                name
                id
                number
                pages: pictures {
                  url: pictureUrl
                }
              }
            }
          }
        `,
        variables: { id: Number(id) }
      })

      const res = data.getHqsById[0].chapters

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    downloadChapter: async ({
      comic,
      chapter
    }): Promise<{ cover: string; pageFiles: string[] }> => {
      this.ipc.send('loading', {
        status: true,
        message: chapter.number,
        progress: { current: 0, total: chapter.pages.length }
      })

      const path = `${this.path}/${slugify(comic.name)}/`

      const chapterPath = path + `${chapter.number}/`

      await CreateDirectory(chapterPath)

      const cover = comic._id ? comic.cover : await DownloadFile(path, comic.cover)

      const pageFiles: string[] = []

      for (const [i, page] of chapter.pages.entries()) {
        pageFiles.push(await DownloadFile(chapterPath, page))
        this.ipc.send('loading', {
          status: true,
          message: chapter.number,
          progress: { current: i + 1, total: chapter.pages.length }
        })
      }

      this.ipc.send('loading', { status: false })

      return new Promise((resolve) => {
        resolve({ cover, pageFiles })
      })
    }
  }
}

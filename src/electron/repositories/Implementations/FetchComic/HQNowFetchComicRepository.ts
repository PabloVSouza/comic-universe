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
    const cache: InMemoryCache = new InMemoryCache({
      addTypename: false
    })
    this.client = new ApolloClient({
      cache,
      link: new HttpLink({ uri: data.url, fetch })
    })
    this.ipc = data.win.webContents
    this.path = data.path
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<Comic[]> => {
      const query = {
        query: gql`
          query {
            getAllHqs {
              siteId: id
              name
              synopsis
              status
            }
          }
        `
      }

      const { data } = await this.client.query(query)

      return new Promise((resolve) => {
        resolve(data.getAllHqs as Comic[])
      })
    },

    search: async ({ search }): Promise<Comic[]> => {
      const query = {
        query: gql`
          query getHqsByName($search: String!) {
            getHqsByName(name: $search) {
              siteId: id
              name
              synopsis
              status
            }
          }
        `,
        variables: { search }
      }

      const { data } = await this.client.query(query)

      return new Promise((resolve) => {
        resolve(data.getHqsByName as Comic[])
      })
    },

    getDetails: async ({ siteId }): Promise<Partial<Comic>> => {
      const { data } = await this.client.query({
        query: gql`
          query getHqsById($id: Int!) {
            getHqsById(id: $id) {
              cover: hqCover
              publisher: publisherName
            }
          }
        `,
        variables: { id: Number(siteId) }
      })

      const res = {
        ...data.getHqsById[0]
      }

      res.type = 'hq'

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getChapters: async ({ siteId }): Promise<Chapter[]> => {
      const query = {
        query: gql`
          query getChaptersByHqId($id: Int!) {
            getChaptersByHqId(hqId: $id) {
              name
              number
              siteId: id
              pages: pictures {
                filename: image
                path: pictureUrl
              }
            }
          }
        `,
        variables: { id: Number(siteId) }
      }

      const { data } = await this.client.query(query)

      return new Promise((resolve) => {
        resolve(data.getChaptersByHqId as Chapter[])
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

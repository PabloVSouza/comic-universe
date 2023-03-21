import { BrowserWindow, WebContents } from 'electron'
import slugify from 'slugify'
import { GraphQLClient, gql } from 'graphql-request'

import { IFetchComicRepository } from '../../IFetchComicRepository'
import CreateDirectory from '../../../utils/CreateDirectory'
import DownloadFile from '../../../utils/DownloadFile'

export class HQNowFetchComicRepository implements IFetchComicRepository {
  client: GraphQLClient
  ipc: WebContents

  constructor(private directory: string, private url: string, private win: BrowserWindow) {
    this.client = new GraphQLClient(this.url)
    this.ipc = this.win.webContents
  }

  methods = {
    getList: async (): Promise<Comic[]> => {
      const query = gql`
        query {
          getAllHqs {
            id
            name
            synopsis
            status
          }
        }
      `

      const data = (await this.client.request(query)) as { getAllHqs: Comic[] }

      return new Promise((resolve) => {
        resolve(data.getAllHqs)
      })
    },

    getDetails: async (id: string): Promise<Partial<Comic>> => {
      const query = gql`
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
      `

      const variables = {
        id: Number(id)
      }

      const res = (await this.client.request(query, variables)) as { getHqsById: Comic[] }

      const data = res.getHqsById[0]
      data.totalChapters = data.chapters?.length

      return new Promise((resolve) => {
        resolve(data)
      })
    },

    getChapters: async (id: string): Promise<Chapter[]> => {
      const query = gql`
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
      `

      const variables = {
        id: Number(id)
      }

      const res = (await this.client.request(query, variables)) as {
        getHqsById: { chapters: Chapter[] }
      }

      const data = res.getHqsById[0].chapters

      return new Promise((resolve) => {
        resolve(data)
      })
    },

    downloadChapter: async (
      comic: Comic,
      chapter: Chapter
    ): Promise<{ cover: string; pageFiles: string[] }> => {
      this.ipc.send('loading', {
        status: true,
        message: chapter.number,
        progress: { current: 0, total: chapter.pages.length }
      })

      const path = `${this.directory}/${slugify(comic.name)}/`

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

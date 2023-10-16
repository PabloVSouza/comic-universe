import { WebContents } from 'electron'
import slugify from 'slugify'
import axios from 'axios'
import qs from 'qs'
import { parse } from 'node-html-parser'
import { toJson } from 'really-relaxed-json'

import {
  IFetchComicMethods,
  IFetchComicRepository,
  IFetchComicRepositoryInit
} from '../../IFetchComicRepository'

import CreateDirectory from '../../../utils/CreateDirectory'
import DownloadFile from '../../../utils/DownloadFile'

export class MangaLivreFetchComicRepository implements IFetchComicRepository {
  ipc: WebContents
  path: string
  url: string

  constructor(data: IFetchComicRepositoryInit) {
    this.ipc = data.win.webContents
    this.path = data.path
    this.url = data.url
  }

  methods: IFetchComicMethods = {
    getList: async (): Promise<Comic[]> => {
      const { data } = await axios({
        method: 'post',
        url: `${this.url}/lib/search/series.json`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-requested-with': 'XMLHttpRequest'
        },
        data: qs.stringify({ search: '%' })
      })

      const res = data.series.reduce((previousComic, comic) => {
        return [
          ...previousComic,
          {
            siteId: comic.id_serie,
            name: comic.name,
            cover: comic.cover,
            author: comic.author,
            artist: comic.artist,
            siteLink: comic.link,
            genres: comic.categories.reduce((previousCat, category) => {
              return [...previousCat, category.name]
            }, [])
          }
        ]
      }, [])

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    search: async ({ search }): Promise<Comic[]> => {
      const { data } = await axios({
        method: 'post',
        url: `${this.url}/lib/search/series.json`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-requested-with': 'XMLHttpRequest'
        },
        data: qs.stringify({ search })
      })

      const res = data.series.reduce((previousComic, comic) => {
        return [
          ...previousComic,
          {
            siteId: comic.id_serie,
            name: comic.name,
            cover: comic.cover,
            author: comic.author,
            artist: comic.artist,
            siteLink: comic.link,
            genres: comic.categories.reduce((previousCat, category) => {
              return [...previousCat, category.name]
            }, [])
          }
        ]
      }, [])

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getDetails: async (search): Promise<Partial<Comic>> => {
      const { siteLink } = search
      const url = this.url + siteLink

      const { data } = await axios.get(url)
      const parsedData = parse(data)

      const synopsis = parsedData.querySelector('.series-desc span')?.rawText

      const res = {
        synopsis
      } as Partial<Comic>

      return new Promise((resolve) => {
        resolve(res)
      })
    },

    getChapters: async ({ siteId }): Promise<Chapter[]> => {
      interface siteChapter {
        id_chapter: string
        number: string
        date: string
        chapter_name: string
        releaseId: string
        releases: []
      }

      let chaptersList: siteChapter[] = []
      const page = 1

      const getChaptersByPage = async (page: number): Promise<void> => {
        const url = this.url + `/series/chapters_list.json?page=${page}&id_serie=${siteId}`

        const { data } = await axios({
          method: 'get',
          url,
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest'
          }
        })

        if (data.chapters.length) {
          chaptersList = [...chaptersList, ...data.chapters]
          page++
          await getChaptersByPage(page)
        }
      }

      await getChaptersByPage(page)

      const res: Chapter[] = []

      for (const chapter of chaptersList) {
        const { id_release, link } =
          chapter.releases[Object.getOwnPropertyNames(chapter.releases)[0]]

        res.push({
          siteId: chapter.id_chapter,
          number: chapter.number,
          date: chapter.date,
          name: chapter.chapter_name,
          offline: false,
          siteLink: link,
          releaseId: id_release
        } as Chapter)
      }

      return new Promise((resolve) => {
        resolve(res.reverse())
      })
    },

    getPages: async ({ releaseId, link }): Promise<Page[]> => {
      const getKey = async (link: string): Promise<string> => {
        const url = this.url + `/${link}`

        const { data } = await axios.get(url)

        const init = data.substring(data.indexOf('config = {') + 9)
        const end = init.substring(0, init.indexOf('}') + 1)

        const json = toJson(end)

        return new Promise((resolve) => {
          resolve(JSON.parse(json).apiKey)
        })
      }

      const key = await getKey(link)

      const res = await axios.get(this.url + `/leitor/pages/${releaseId}.json?key=${key}`)

      const pages = res.data.images.reduce((acc, cur) => {
        return [
          ...acc,
          {
            path: cur.legacy,
            filename: cur.legacy.substring(cur.legacy.lastIndexOf('/') + 1)
          } as Page
        ]
      }, [])

      return pages
    },

    downloadChapter: async ({ comic, chapter }): Promise<{ cover: string; pageFiles: Page[] }> => {
      this.ipc.send('loading', {
        status: true,
        message: chapter.number,
        progress: { current: 0, total: chapter.pages.length }
      })

      const path = `${this.path}/${slugify(comic.name)}/`

      const chapterPath = path + `${chapter.number}/`

      await CreateDirectory(chapterPath)

      const cover = comic.id ? comic.cover : await DownloadFile(path, comic.cover)

      const pageFiles: Page[] = []

      for (const [i, page] of chapter.pages.entries()) {
        await DownloadFile(chapterPath, page.path)
        pageFiles.push(page)
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

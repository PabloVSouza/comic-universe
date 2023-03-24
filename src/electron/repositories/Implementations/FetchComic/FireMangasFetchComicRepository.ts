import axios from 'axios'
import { parse } from 'node-html-parser'

import { IFetchComicRepository } from '../../IFetchComicRepository'
import CreateDirectory from '../../../utils/CreateDirectory'
import DownloadFile from '../../../utils/DownloadFile'

export class FireMangasFetchComicRepository implements IFetchComicRepository {
  url: string
  directory: string
  api: typeof axios

  constructor(directory: string, url: string) {
    this.url = url
    this.directory = directory
    this.api = axios
  }

  methods = {
    getList: async (): Promise<Comic[]> => {
      return []
    },

    getDetails: async (id: string): Promise<Partial<Comic>> => {
      return {}
    },

    getPages: async (chapter: Chapter): Promise<string[]> => {
      return []
    },

    getChapters: async (id: string): Promise<Chapter[]> => {
      return []
    },

    downloadChapter: async (
      comic: Comic,
      chapter: Chapter
    ): Promise<{ cover: string; pageFiles: string[] }> => {
      return { cover: '', pageFiles: [] }
    }
  }
}

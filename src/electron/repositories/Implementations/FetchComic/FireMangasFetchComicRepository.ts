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

  async getList(): Promise<Comic[]> {
    return []
  }

  async getDetails(id: string): Promise<Partial<Comic>> {
    return {}
  }

  async getPages(chapter: Chapter): Promise<string[]> {
    return []
  }

  async getChapters(id: string): Promise<Chapter[]> {
    return []
  }

  async downloadChapter(
    comic: Comic,
    chapter: Chapter
  ): Promise<{ cover: string; pageFiles: string[] }> {
    return { cover: '', pageFiles: [] }
  }
}

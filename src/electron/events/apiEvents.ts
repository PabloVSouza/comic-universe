import { ipcMain, BrowserWindow } from 'electron'
import FetchComicRepository from '../repositories/Implementations/FetchComic'

const apiEvents = (win: BrowserWindow, path: string): void => {
  const fetchComicRepos = {
    hqnow: FetchComicRepository('hqnow', {
      path,
      url: 'https://admin.hq-now.com/graphql',
      win
    }),
    mangalivre: FetchComicRepository('mangalivre', {
      path,
      url: 'https://mangalivre.net',
      win
    })
  }

  const firstRepo = Object.getOwnPropertyNames(fetchComicRepos)[0]

  const properties = Object.getOwnPropertyNames(fetchComicRepos[firstRepo].methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, { repo, data }) =>
      fetchComicRepos[repo].methods[method](data)
    )
  }
}

export default apiEvents

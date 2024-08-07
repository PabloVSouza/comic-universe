import { ipcMain, BrowserWindow } from 'electron'
import FetchComicRepository from '../repositories/Implementations/FetchComic'

const apiEvents = (win: BrowserWindow, path: string): void => {
  const repoBasics = {
    path,
    win
  }

  const fetchComicRepos = {
    hqnow: FetchComicRepository('hqnow', {
      ...repoBasics,
      url: 'https://admin.hq-now.com/graphql'
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

import { ipcMain, BrowserWindow } from 'electron'
import { FetchComicRepository } from '../repositories/Implementations/FetchComic'

const apiEvents = (win: BrowserWindow, path: string): void => {
  const fetchComic = new FetchComicRepository('hqnow', {
    path,
    url: 'https://admin.hq-now.com/graphql',
    win
  })

  const properties = Object.getOwnPropertyNames(fetchComic.repo.methods)

  for (const method of properties) {
    ipcMain.handle(method, async (_event, data) => fetchComic.repo.methods[method](data))
  }
}

export default apiEvents

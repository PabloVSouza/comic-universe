import { ipcMain, app, BrowserWindow } from 'electron'
import { FetchComicRepository } from '../repositories/Implementations/FetchComic'
const { handle } = ipcMain

const eventList = (win: BrowserWindow): void => {
  const fetchComic = new FetchComicRepository(
    'hqnow',
    app.getPath('userData'),
    'https://www.hq-now.com/',
    win
  )

  const properties = Object.getOwnPropertyNames(fetchComic.repo.methods)

  for (const method of properties) {
    handle(method, async (_event, data) => fetchComic.repo.methods[method](data))
  }
}

export default eventList

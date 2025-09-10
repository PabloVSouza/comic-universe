import { ElectronAPI } from '@electron-toolkit/preload'
import { PlatformPath } from 'path'
import { IDBInteractionsRepository } from 'repositories/Implementations/DBImplementations/IDBInteractionsRepository'
import { ComicUniverseAPI } from './ApiTypes'

declare global {
  interface Window {
    Electron: ElectronAPI
    api: ComicUniverseAPI
    path: PlatformPath
    app: {
      version: string
      description: string
      repository: string
      license: string
      author: string
      path: string
    }
    db: IDBInteractionsRepository
    isDev: boolean
  }
}

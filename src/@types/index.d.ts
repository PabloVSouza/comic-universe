import { ElectronAPI } from '@electron-toolkit/preload'
import { PlatformPath } from 'path'
import { IDBInteractionsRepository } from 'repositories/Implementations/DBImplementations/IDBInteractionsRepository'
import { ComicUniverseAPI } from './ApiTypes'

// Extend ElectronAPI to include window control methods
interface ExtendedElectronAPI extends ElectronAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

declare global {
  interface Window {
    Electron: ExtendedElectronAPI
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

import { ElectronAPI } from '@electron-toolkit/preload'
import { PlatformPath } from 'path'
import { IDBInteractionsRepository } from '../electron/repositories/Implementations/DBImplementations/IDBInteractionsRepository'

declare global {
  interface Window {
    Electron: ElectronAPI
    api: unknown
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

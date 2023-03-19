import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    Electron: ElectronAPI
    api: unknown
    app: {
      version: string
      description: string
      repository: string
      license: string
      author: string
      path: string
    }
  }
}

import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const initializePreload = async (): Promise<void> => {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('Electron', electronAPI)
    } catch (error) {
      console.error(error)
    }
  } else {
    // @ts-ignore (define in dts)
    window.Electron = electronAPI
  }
}

initializePreload()

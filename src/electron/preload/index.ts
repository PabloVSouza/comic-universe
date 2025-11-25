import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

export interface DeepLinkData {
  action: string
  type?: string
  url?: string
  name?: string
  id?: string
  data?: Record<string, unknown>
}

type DeepLinkListener = (data: DeepLinkData) => void

const initializePreload = async (): Promise<void> => {
  // Deep link utilities
  const deepLinkUtils = {
    onDeepLink: (callback: DeepLinkListener): (() => void) => {
      ipcRenderer.on('deep-link-received', (_event, data: DeepLinkData) => {
        callback(data)
      })
      // Return unsubscribe function
      return () => {
        ipcRenderer.removeAllListeners('deep-link-received')
      }
    },
    notifyReady: (): void => {
      ipcRenderer.send('deep-link-ready')
    }
  }

  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('Electron', {
        ...electronAPI,
        minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
        maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
        closeWindow: () => ipcRenderer.invoke('close-window'),
        deepLink: deepLinkUtils
      })
    } catch (error) {
      console.error(error)
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Electron = {
      ...electronAPI,
      minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
      maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
      closeWindow: () => ipcRenderer.invoke('close-window'),
      deepLink: deepLinkUtils
    }
  }
}

initializePreload()

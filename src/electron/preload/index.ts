import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

const initializePreload = async (): Promise<void> => {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('Electron', {
        ...electronAPI,
        minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
        maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
        closeWindow: () => ipcRenderer.invoke('close-window')
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
      closeWindow: () => ipcRenderer.invoke('close-window')
    }
  }
}

initializePreload()

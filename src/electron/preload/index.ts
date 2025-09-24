import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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
    // @ts-ignore (define in dts)
    window.Electron = {
      ...electronAPI,
      minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
      maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
      closeWindow: () => ipcRenderer.invoke('close-window')
    }
  }
}

initializePreload()

const IpcImplementation = {
  invoke: async (method: string, args?: unknown) => {
    if (typeof window !== 'undefined' && window.Electron) {
      return await window.Electron.ipcRenderer.invoke(method, args)
    }
    throw new Error('IPC not available in this environment')
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (typeof window !== 'undefined' && window.Electron) {
      return window.Electron.ipcRenderer.on(channel, callback)
    }
    console.warn('IPC listener not available in this environment')
    return undefined
  },
  removeAllListeners: (channel: string) => {
    if (typeof window !== 'undefined' && window.Electron) {
      return window.Electron.ipcRenderer.removeAllListeners(channel)
    }
    console.warn('IPC listener cleanup not available in this environment')
  }
}

export default IpcImplementation

import IpcImplementation from './api/IpcImplementation'
import RestImplemention from './api/RestImplementation'

interface ApiImplementation {
  invoke: <T = unknown>(method: string, args?: unknown) => Promise<T>
  on?: (channel: string, callback: (...args: unknown[]) => void) => void
  removeAllListeners?: (channel: string) => void
}

const ApiList: Record<string, ApiImplementation> = { IpcImplementation, RestImplemention }

const getDefaultImplementation = (): keyof typeof ApiList => {
  if (typeof window !== 'undefined' && window.Electron) {
    return 'IpcImplementation'
  }
  return 'RestImplemention'
}

const useApi = (implementation?: string) => {
  const selectedImplementation = implementation || getDefaultImplementation()

  return {
    invoke: async <T = unknown,>(method: string, args?: unknown): Promise<T> => {
      return await ApiList[selectedImplementation].invoke<T>(method, args)
    },
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      if (selectedImplementation === 'IpcImplementation' && ApiList[selectedImplementation].on) {
        return ApiList[selectedImplementation].on!(channel, callback)
      }
      console.warn(`IPC listener 'on' is not available in ${selectedImplementation} implementation`)
    },
    removeAllListeners: (channel: string) => {
      if (
        selectedImplementation === 'IpcImplementation' &&
        ApiList[selectedImplementation].removeAllListeners
      ) {
        return ApiList[selectedImplementation].removeAllListeners!(channel)
      }
      console.warn(
        `IPC listener 'removeAllListeners' is not available in ${selectedImplementation} implementation`
      )
    }
  }
}

export default useApi

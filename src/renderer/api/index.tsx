import IpcImplementation from './IpcImplementation'
import RestImplemention from './RestImplementation'

interface ApiImplementation {
  invoke: (method: string, args?: unknown) => Promise<unknown>
  on?: (channel: string, callback: (...args: unknown[]) => void) => void
  removeAllListeners?: (channel: string) => void
}

const ApiList: Record<string, ApiImplementation> = { IpcImplementation, RestImplemention }

// Auto-detect environment: Electron window uses IPC, browser uses REST
const getDefaultImplementation = (): keyof typeof ApiList => {
  // Check if we're running in Electron (window.Electron exists)
  if (typeof window !== 'undefined' && window.Electron) {
    return 'IpcImplementation'
  }
  // Fallback to REST for browser environment
  return 'RestImplemention'
}

const useApi = (implementation?: string) => {
  const selectedImplementation = implementation || getDefaultImplementation()

  return {
    invoke: async (method: string, args?: unknown) => {
      return await ApiList[selectedImplementation].invoke(method, args)
    },
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      // Only expose 'on' method for IPC implementation
      if (selectedImplementation === 'IpcImplementation' && ApiList[selectedImplementation].on) {
        return ApiList[selectedImplementation].on!(channel, callback)
      }
      // For REST implementation, 'on' method is not available
      console.warn(`IPC listener 'on' is not available in ${selectedImplementation} implementation`)
    },
    removeAllListeners: (channel: string) => {
      // Only expose 'removeAllListeners' method for IPC implementation
      if (
        selectedImplementation === 'IpcImplementation' &&
        ApiList[selectedImplementation].removeAllListeners
      ) {
        return ApiList[selectedImplementation].removeAllListeners!(channel)
      }
      // For REST implementation, 'removeAllListeners' method is not available
      console.warn(
        `IPC listener 'removeAllListeners' is not available in ${selectedImplementation} implementation`
      )
    }
  }
}

export default useApi

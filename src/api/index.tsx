import IpcImplementation from './IpcImplementation'
import RestImplemention from './RestImplementation'
import TauriImplementation from './TauriImplementation'

const ApiList = { IpcImplementation, RestImplemention, TauriImplementation }

const defaultImplementation = 'TauriImplementation' as keyof typeof ApiList

const useApi = (implementation: string = defaultImplementation) => {
  return {
    invoke: async (method: string, args?: any) => {
      return await ApiList[implementation].invoke(method, args)
    }
  }
}

export default useApi

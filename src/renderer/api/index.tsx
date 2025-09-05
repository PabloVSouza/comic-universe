import IpcImplementation from './IpcImplementation'
import RestImplemention from './RestImplementation'

const ApiList = { IpcImplementation, RestImplemention }

const defaultImplementation = 'IpcImplementation' as keyof typeof ApiList

const useApi = (implementation: string = defaultImplementation) => {
  return {
    invoke: async (method: string, args?: any) => {
      return await ApiList[implementation].invoke(method, args)
    }
  }
}

export default useApi

import IpcImplementation from './IpcImplementation'
import RestImplemention from './RestImplementation'

const ApiList = { IpcImplementation, RestImplemention }

const defaultImplementation = 'RestImplemention' as keyof typeof ApiList

const useApi = (implementation: string = defaultImplementation) => {
  return {
    invoke: async (method: string, args?: any) => {
      // console.log(`Call ${method}, args: ${JSON.stringify(args)}`)
      return await ApiList[implementation].invoke(method, args)
    }
  }
}

export default useApi

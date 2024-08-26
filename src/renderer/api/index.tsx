import IpcImplementation from './IpcImplementation'

const ApiList = { IpcImplementation }

const defaultImplementation = 'IpcImplementation'

const useApi = (implementation: string = defaultImplementation) => {
  return {
    invoke: async (method: string, args?: any) => {
      console.log(`Call ${method}, args: ${JSON.stringify(args)}`)
      return await ApiList[implementation].invoke(method, args)
    },
    on: ApiList[implementation].on
  }
}

export default useApi

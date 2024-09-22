// import IpcImplementation from './IpcImplementation'
import RestImplemention from './RestImplementation'

// const ApiList = { IpcImplementation, RestImplemention }

const defaultImplementation = 'RestImplementation'

const useApi = (_implementation: string = defaultImplementation) => {
  return {
    invoke: async (method: string, args?: any) => {
      console.log(`Call ${method}, args: ${JSON.stringify(args)}`)
      return await RestImplemention.invoke(method, args)
    }
  }
}

export default useApi

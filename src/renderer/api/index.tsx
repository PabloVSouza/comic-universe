import IpcImplementation from './IpcImplementation'

const ApiList = { IpcImplementation }

const defaultImplementation = 'IpcImplementation'

const useApi = (implementation: string = defaultImplementation) => {
  return {
    invoke: ApiList[implementation].invoke,
    on: ApiList[implementation].on
  }
}

export default useApi

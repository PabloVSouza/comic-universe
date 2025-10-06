import axios from 'axios'
import { isWebUI } from 'renderer-utils/environment'

const getCurrentPort = (): number => {
  if (isWebUI() && typeof window !== 'undefined' && window.location.port) {
    return parseInt(window.location.port, 10)
  }
  return 8080
}

const api = axios.create({
  baseURL: `http://localhost:${getCurrentPort()}/`
})

const RestImplementation = {
  invoke: async <T = unknown,>(method: string, args: unknown): Promise<T> => {
    const { data } = await api.post(method, args)
    return data
  },
  on: () => {}
}

export default RestImplementation

import axios from 'axios'
import { isWebUI } from 'renderer-utils/environment'

// Get the current port from the URL if we're in Web UI mode
const getCurrentPort = (): number => {
  if (isWebUI() && typeof window !== 'undefined' && window.location.port) {
    return parseInt(window.location.port, 10)
  }
  return 8888 // fallback to default port
}

const api = axios.create({
  baseURL: `http://localhost:${getCurrentPort()}/`
})

const RestImplementation = {
  invoke: async (method: string, args: unknown) => {
    const { data } = await api.post(method, args)
    return data
  },
  on: () => {}
}

export default RestImplementation

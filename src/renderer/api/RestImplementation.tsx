import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:8888/'
})

const RestImplementation = {
  invoke: async (method: string, args) => {
    const { data } = await api.post(method, args)
    return data
  },
  on: () => {}
}

export default RestImplementation

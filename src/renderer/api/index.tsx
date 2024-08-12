import axios from 'axios'

const api = axios.create({
  baseURL: 'https://comic-universe.vercel.app/api/'
})

export default api

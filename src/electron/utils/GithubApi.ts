import Axios from 'axios'

const axios = Axios.create({
  baseURL: 'https://api.github.com'
})

export default axios

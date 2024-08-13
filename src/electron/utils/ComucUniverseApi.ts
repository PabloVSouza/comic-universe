import Axios from 'axios'

export default Axios.create({
  baseURL: 'https://comic-universe.vercel.app/api'
})

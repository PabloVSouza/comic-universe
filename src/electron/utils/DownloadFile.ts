import axios from 'axios'
import fs from 'fs'
import { pipeline } from 'stream/promises'

const DownloadFile = async (path: string, url: string): Promise<string> => {
  const fileName = url.substring(url.lastIndexOf('/') + 1)

  const response = await axios({
    method: 'get',
    url,
    responseType: 'stream'
  })

  await pipeline(response.data, fs.createWriteStream(path + fileName))

  return path + fileName
}

export default DownloadFile

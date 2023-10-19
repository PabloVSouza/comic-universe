import axios from 'axios'
import fs from 'fs'

const DownloadFile = async (path: string, url: string): Promise<string> => {
  const fileName = url.substring(url.lastIndexOf('/') + 1)

  const response = await axios({
    method: 'get',
    url,
    responseType: 'stream'
  })

  await response.data.pipe(fs.createWriteStream(path + fileName))

  return new Promise((resolve) => {
    resolve(fileName)
  })
}

export default DownloadFile

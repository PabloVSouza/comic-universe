import fs from 'fs'
import { pipeline } from 'stream/promises'

const DownloadFile = async (path: string, url: string): Promise<string> => {
  const fileName = url.substring(url.lastIndexOf('/') + 1)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  const fileStream = fs.createWriteStream(path + fileName)

  await pipeline(response.body as unknown as NodeJS.ReadableStream, fileStream)

  return path + fileName
}

export default DownloadFile

import fs from 'fs'
import { pipeline } from 'stream/promises'

const DownloadFile = async (path: string, url: string): Promise<string> => {
  const fileName = url.substring(url.lastIndexOf('/') + 1)

  // Fetch the resource
  const response = await fetch(url)

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  // Create a write stream to save the file
  const fileStream = fs.createWriteStream(path + fileName)

  // Use pipeline to handle streaming the data to the file
  await pipeline(response.body as NodeJS.ReadableStream, fileStream)

  return path + fileName
}

export default DownloadFile

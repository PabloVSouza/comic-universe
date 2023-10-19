import fs from 'fs'

const CreateDirectory = (path: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true
      })
    }
    resolve(path)
  })
}

export default CreateDirectory

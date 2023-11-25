import fs from 'fs'

const CreateDirectory = (path: string): string => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, {
      recursive: true
    })
  }

  return path
}

export default CreateDirectory

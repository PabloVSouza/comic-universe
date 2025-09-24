import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync, statSync } from 'fs'
import path from 'path'
import { DataPaths } from 'electron-utils/utils'

interface WallpaperInfo {
  filename: string
  path: string
  isDefault: boolean
}

class WallpaperRepository {
  private wallpaperDirectory: string

  constructor() {
    // Create wallpaper directory in user data folder
    this.wallpaperDirectory = path.join(DataPaths.getBaseDataPath(), 'wallpapers')
    this.ensureWallpaperDirectory()
  }

  private ensureWallpaperDirectory(): void {
    if (!existsSync(this.wallpaperDirectory)) {
      mkdirSync(this.wallpaperDirectory, { recursive: true })
    }
  }

  public methods = {
    getWallpaperDirectory: async (): Promise<string> => {
      return this.wallpaperDirectory
    },

    getAvailableWallpapers: async (): Promise<WallpaperInfo[]> => {
      const wallpapers: WallpaperInfo[] = []

      // Add default wallpaper
      wallpapers.push({
        filename: 'default.webp',
        path: 'default',
        isDefault: true
      })

      // Add custom wallpapers
      if (existsSync(this.wallpaperDirectory)) {
        const files = readdirSync(this.wallpaperDirectory)
        for (const file of files) {
          const filePath = path.join(this.wallpaperDirectory, file)
          const stat = statSync(filePath)

          if (stat.isFile() && this.isSupportedImageFormat(file)) {
            wallpapers.push({
              filename: file,
              path: filePath,
              isDefault: false
            })
          }
        }
      }

      return wallpapers
    },

    addWallpaper: async ({ filePath }: { filePath: string }): Promise<string> => {
      if (!existsSync(filePath)) {
        throw new Error('Source file does not exist')
      }

      const filename = path.basename(filePath)
      if (!this.isSupportedImageFormat(filename)) {
        throw new Error('Unsupported image format')
      }

      // Generate unique filename if file already exists
      let finalFilename = filename
      let counter = 1
      while (existsSync(path.join(this.wallpaperDirectory, finalFilename))) {
        const ext = path.extname(filename)
        const name = path.basename(filename, ext)
        finalFilename = `${name}_${counter}${ext}`
        counter++
      }

      const destinationPath = path.join(this.wallpaperDirectory, finalFilename)
      copyFileSync(filePath, destinationPath)

      return finalFilename
    },

    removeWallpaper: async ({ filename }: { filename: string }): Promise<void> => {
      if (filename === 'default.webp') {
        throw new Error('Cannot remove default wallpaper')
      }

      const filePath = path.join(this.wallpaperDirectory, filename)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      } else {
        throw new Error('Wallpaper file not found')
      }
    }
  }

  private isSupportedImageFormat(filename: string): boolean {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
    const ext = path.extname(filename).toLowerCase()
    return supportedFormats.includes(ext)
  }
}

export default WallpaperRepository

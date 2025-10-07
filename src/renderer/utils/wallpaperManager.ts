import path from 'path'
import { useApi } from 'hooks'
import defaultWallpaper from 'assets/wallpaper.webp'

export interface WallpaperInfo {
  filename: string
  path: string
  isDefault: boolean
}

class WallpaperManager {
  private api: ReturnType<typeof useApi>

  constructor() {
    this.api = useApi()
  }

  async getWallpaperDirectory(): Promise<string> {
    return await this.api.invoke('getWallpaperDirectory')
  }

  async getAvailableWallpapers(): Promise<WallpaperInfo[]> {
    return await this.api.invoke('getAvailableWallpapers')
  }

  async addWallpaper(filePath: string): Promise<string> {
    return await this.api.invoke('addWallpaper', { filePath })
  }

  async removeWallpaper(filename: string): Promise<void> {
    return await this.api.invoke('removeWallpaper', { filename })
  }

  async getWallpaperUrl(filename: string): Promise<string> {
    if (filename === 'default.webp') {
      return defaultWallpaper
    }

    const port = await this.api.invoke('getAssetServerPort')
    const encodedFilename = encodeURIComponent(filename)
    return `http://localhost:${port}/wallpapers/${encodedFilename}`
  }

  isSupportedImageFormat(filename: string): boolean {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
    const ext = path.extname(filename).toLowerCase()
    return supportedFormats.includes(ext)
  }
}

export default new WallpaperManager()

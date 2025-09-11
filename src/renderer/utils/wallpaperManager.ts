import useApi from 'api'
import path from 'path'

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

  /**
   * Get the wallpaper directory path
   */
  async getWallpaperDirectory(): Promise<string> {
    return await this.api.invoke('getWallpaperDirectory')
  }

  /**
   * Get list of available wallpapers
   */
  async getAvailableWallpapers(): Promise<WallpaperInfo[]> {
    return await this.api.invoke('getAvailableWallpapers')
  }

  /**
   * Add a new wallpaper by copying from a local file
   */
  async addWallpaper(filePath: string): Promise<string> {
    return await this.api.invoke('addWallpaper', { filePath })
  }

  /**
   * Remove a wallpaper
   */
  async removeWallpaper(filename: string): Promise<void> {
    return await this.api.invoke('removeWallpaper', { filename })
  }

  /**
   * Get the URL for a wallpaper (for display purposes)
   */
  getWallpaperUrl(filename: string): string {
    // In development, serve from the wallpaper directory
    // In production, this will be handled by the main process
    return `/api/wallpapers/${filename}`
  }

  /**
   * Validate if a file is a supported image format
   */
  isSupportedImageFormat(filename: string): boolean {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
    const ext = path.extname(filename).toLowerCase()
    return supportedFormats.includes(ext)
  }
}

export default new WallpaperManager()

import useApi from 'api'
import path from 'path'
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

  /**
   * Get the wallpaper directory path
   */
  async getWallpaperDirectory(): Promise<string> {
    return await this.api.invoke('getWallpaperDirectory')
  }

  /**
   * Get list of available image wallpapers
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
   * Get the URL for an image wallpaper (for display purposes)
   */
  async getWallpaperUrl(filename: string): Promise<string> {
    // Handle default wallpaper - use the imported asset which has the correct hash
    if (filename === 'default.webp') {
      return defaultWallpaper
    }

    // For custom wallpapers, use the asset server
    const port = await this.api.invoke('getAssetServerPort')
    // Properly encode the filename for URL
    const encodedFilename = encodeURIComponent(filename)
    return `http://localhost:${port}/wallpapers/${encodedFilename}`
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

import { wallpaperComponents } from 'components/WallpaperComponents'
import wallpaperManager, { WallpaperInfo } from './wallpaperManager'

// Extended wallpaper info that includes all types
export interface ExtendedWallpaperInfo extends WallpaperInfo {
  displayName?: string
  preview?: string
  isSpecial?: boolean
  type?: 'image' | 'component'
}

class WallpaperList {
  /**
   * Get all available wallpapers (both image and component wallpapers)
   */
  async getAllWallpapers(): Promise<ExtendedWallpaperInfo[]> {
    // Get image wallpapers from wallpaperManager
    const imageWallpapers = await wallpaperManager.getAvailableWallpapers()

    // Convert component wallpapers to WallpaperInfo format
    const componentWallpapers: ExtendedWallpaperInfo[] = Object.entries(wallpaperComponents).map(
      ([filename, info]) => ({
        filename,
        path: filename,
        isDefault: filename === 'starry-sky', // StarrySky is now the default
        isSpecial: true,
        type: 'component' as const,
        displayName: info.displayName,
        preview: info.preview
      })
    )

    // Filter out component wallpapers from imageWallpapers and remove default flag from image wallpapers
    const componentFilenames = Object.keys(wallpaperComponents)
    const pureImageWallpapers = imageWallpapers
      .filter((wallpaper) => !componentFilenames.includes(wallpaper.filename))
      .map((wallpaper) => ({
        ...wallpaper,
        isDefault: false // No image wallpapers are default anymore, StarrySky is the default
      }))

    // Combine: component wallpapers first, then image wallpapers
    return [...componentWallpapers, ...pureImageWallpapers]
  }

  /**
   * Get preview URL for any wallpaper (image or component)
   */
  async getWallpaperPreviewUrl(wallpaper: ExtendedWallpaperInfo): Promise<string> {
    if (wallpaper.isSpecial && wallpaper.preview) {
      // Component wallpaper with embedded preview
      return wallpaper.preview
    }

    // Image wallpaper - use wallpaperManager
    return await wallpaperManager.getWallpaperUrl(wallpaper.filename)
  }

  /**
   * Get display name for a wallpaper
   */
  getWallpaperDisplayName(wallpaper: ExtendedWallpaperInfo, t?: (key: string) => string): string {
    if (wallpaper.displayName) {
      return wallpaper.displayName
    }

    if (wallpaper.isDefault) {
      return t ? t('Settings.user.wallpaper.default') : 'Default'
    }

    return wallpaper.filename
  }

  /**
   * Check if a wallpaper can be removed
   */
  canRemoveWallpaper(wallpaper: ExtendedWallpaperInfo): boolean {
    return !wallpaper.isDefault && !wallpaper.isSpecial
  }
}

export default new WallpaperList()

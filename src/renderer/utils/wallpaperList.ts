import { wallpaperComponents } from 'components/WallpaperComponents'
import wallpaperManager, { WallpaperInfo } from './wallpaperManager'

export interface ExtendedWallpaperInfo extends WallpaperInfo {
  displayName?: string
  preview?: string
  isSpecial?: boolean
  type?: 'image' | 'component'
}

class WallpaperList {
  
  async getAllWallpapers(): Promise<ExtendedWallpaperInfo[]> {
    const imageWallpapers = await wallpaperManager.getAvailableWallpapers()

    const componentWallpapers: ExtendedWallpaperInfo[] = Object.entries(wallpaperComponents).map(
      ([filename, info]) => ({
        filename,
        path: filename,
        isDefault: filename === 'starry-sky',
        isSpecial: true,
        type: 'component' as const,
        displayName: info.displayName,
        preview: info.preview
      })
    )

    const componentFilenames = Object.keys(wallpaperComponents)
    const pureImageWallpapers = imageWallpapers
      .filter((wallpaper) => !componentFilenames.includes(wallpaper.filename))
      .map((wallpaper) => ({
        ...wallpaper,
        isDefault: false
      }))

    return [...componentWallpapers, ...pureImageWallpapers]
  }

  
  async getWallpaperPreviewUrl(wallpaper: ExtendedWallpaperInfo): Promise<string> {
    if (wallpaper.isSpecial && wallpaper.preview) {
      return wallpaper.preview
    }

    return await wallpaperManager.getWallpaperUrl(wallpaper.filename)
  }

  
  getWallpaperDisplayName(wallpaper: ExtendedWallpaperInfo, t?: (key: string) => string): string {
    if (wallpaper.displayName) {
      return wallpaper.displayName
    }

    if (wallpaper.isDefault) {
      return t ? t('Settings.user.wallpaper.default') : 'Default'
    }

    return wallpaper.filename
  }

  
  canRemoveWallpaper(wallpaper: ExtendedWallpaperInfo): boolean {
    return !wallpaper.isDefault && !wallpaper.isSpecial
  }
}

export default new WallpaperList()

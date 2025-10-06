import React, { useEffect, useState } from 'react'
import wallpaperManager from 'renderer-utils/wallpaperManager'
import { wallpaperComponents } from 'components/WallpaperComponents'

interface WallpaperRendererProps {
  wallpaper: string | null
  className?: string
}

// Placeholder component for unregistered wallpapers
const WallpaperPlaceholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
    {name} Placeholder
  </div>
)

const WallpaperRenderer: React.FC<WallpaperRendererProps> = ({ wallpaper, className = '' }) => {
  const [wallpaperUrl, setWallpaperUrl] = useState<string>('')
  const [isComponent, setIsComponent] = useState(false)

  useEffect(() => {
    const loadWallpaper = async () => {
      if (!wallpaper) {
        // Use StarrySky as default wallpaper when none is specified
        setIsComponent(true)
        setWallpaperUrl('')
        return
      }

      // Check if it's a special component wallpaper
      if (wallpaperComponents[wallpaper]) {
        setIsComponent(true)
        setWallpaperUrl('')
        return
      }

      // Handle regular image wallpapers
      try {
        const url = await wallpaperManager.getWallpaperUrl(wallpaper)
        setWallpaperUrl(url)
        setIsComponent(false)
      } catch (error) {
        console.error('Error loading wallpaper:', error)
        // Fallback to default
        const defaultUrl = await wallpaperManager.getWallpaperUrl('default.webp')
        setWallpaperUrl(defaultUrl)
        setIsComponent(false)
      }
    }

    loadWallpaper()
  }, [wallpaper])

  // Render component wallpapers
  if (isComponent) {
    // Use StarrySky as default if no wallpaper specified
    const effectiveWallpaper = wallpaper || 'starry-sky'
    const wallpaperInfo = wallpaperComponents[effectiveWallpaper]
    const WallpaperComponent = wallpaperInfo?.component || null

    return (
      <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: -1 }}>
        {WallpaperComponent ? (
          <WallpaperComponent />
        ) : (
          <WallpaperPlaceholder name={effectiveWallpaper} />
        )}
      </div>
    )
  }

  // Render image wallpapers
  if (wallpaperUrl) {
    return (
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none ${className}`}
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
          zIndex: -1
        }}
      />
    )
  }

  // Fallback: no wallpaper
  return null
}

export default WallpaperRenderer

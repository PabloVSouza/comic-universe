import React from 'react'
import StarrySky, { previewImage as starrySkyPreview } from './StarrySky'

// Wallpaper component definition
export interface WallpaperComponentInfo {
  component: React.ComponentType
  preview: string
  displayName: string
}

// Registry of all available wallpaper components
// Maps wallpaper filename to component info
export const wallpaperComponents: Record<string, WallpaperComponentInfo> = {
  'starry-sky': {
    component: StarrySky,
    preview: starrySkyPreview,
    displayName: 'Starry Sky'
  }
}

// Export individual components for direct imports if needed
export { StarrySky }

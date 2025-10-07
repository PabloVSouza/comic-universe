import React from 'react'
import StarrySky, { previewImage as starrySkyPreview } from './StarrySky'

export interface WallpaperComponentInfo {
  component: React.ComponentType
  preview: string
  displayName: string
}

export const wallpaperComponents: Record<string, WallpaperComponentInfo> = {
  'starry-sky': {
    component: StarrySky,
    preview: starrySkyPreview,
    displayName: 'Starry Sky'
  }
}

export { StarrySky }

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import wallpaperManager, { WallpaperInfo } from 'renderer-utils/wallpaperManager'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

interface WallpaperSelectorProps {
  currentWallpaper: string | null
  onWallpaperChange: (wallpaper: string | null) => void
}

const WallpaperSelector = ({ currentWallpaper, onWallpaperChange }: WallpaperSelectorProps) => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(currentWallpaper)

  const { data: wallpapers = [], isLoading } = useQuery({
    queryKey: ['wallpapers'],
    queryFn: () => wallpaperManager.getAvailableWallpapers(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const { mutate: addWallpaper } = useMutation({
    mutationFn: (filePath: string) => wallpaperManager.addWallpaper(filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallpapers'] })
    }
  })

  const { mutate: removeWallpaper } = useMutation({
    mutationFn: (filename: string) => wallpaperManager.removeWallpaper(filename),
    onSuccess: (_, filename) => {
      queryClient.invalidateQueries({ queryKey: ['wallpapers'] })
      // If the removed wallpaper was selected, reset to default
      if (selectedWallpaper && selectedWallpaper.includes(filename)) {
        setSelectedWallpaper(null)
        onWallpaperChange(null)
      }
    }
  })

  const handleFileSelect = async () => {
    try {
      const result = await invoke('showOpenDialog', {
        properties: ['openFile'],
        filters: [
          {
            name: 'Images',
            extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
          }
        ]
      })

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        addWallpaper(filePath)
      }
    } catch (error) {
      console.error('Error selecting wallpaper file:', error)
    }
  }

  const handleWallpaperSelect = (wallpaper: WallpaperInfo) => {
    const wallpaperValue = wallpaper.isDefault ? null : wallpaper.filename
    setSelectedWallpaper(wallpaperValue)
    onWallpaperChange(wallpaperValue)
  }

  const handleRemoveWallpaper = (filename: string) => {
    if (confirm(t('Settings.user.wallpaper.removeConfirm'))) {
      removeWallpaper(filename)
    }
  }

  const getWallpaperUrl = (wallpaper: WallpaperInfo): string => {
    if (wallpaper.isDefault) {
      return wallpaper.path
    }
    return wallpaperManager.getWallpaperUrl(wallpaper.filename)
  }

  useEffect(() => {
    setSelectedWallpaper(currentWallpaper)
  }, [currentWallpaper])

  return (
    <div className="flex flex-col gap-4">
      <SettingsItem
        labelI18nKey="Settings.user.wallpaper.label"
        descriptionI18nKey="Settings.user.wallpaper.description"
      >
        <Button
          onClick={handleFileSelect}
          theme="pure"
          size="s"
          icon="assets/upload.svg"
          className="!size-7"
          title={t('Settings.user.wallpaper.addWallpaper')}
        />
      </SettingsItem>

      {/* Wallpaper grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="col-span-full text-center text-text-default opacity-70 py-4">
            {t('General.checking')}
          </div>
        ) : (
          wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.filename}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedWallpaper === (wallpaper.isDefault ? null : wallpaper.filename)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => handleWallpaperSelect(wallpaper)}
            >
              <img
                src={getWallpaperUrl(wallpaper)}
                alt={wallpaper.filename}
                className="w-full h-20 object-cover"
              />

              {/* Overlay with wallpaper name */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end">
                <div className="w-full p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white text-xs truncate">
                    {wallpaper.isDefault
                      ? t('Settings.user.wallpaper.default')
                      : wallpaper.filename}
                  </p>
                </div>
              </div>

              {/* Remove button for custom wallpapers */}
              {!wallpaper.isDefault && (
                <Button
                  onClick={() => {
                    handleRemoveWallpaper(wallpaper.filename)
                  }}
                  theme="pure"
                  size="s"
                  icon="assets/cancel.svg"
                  className="absolute top-1 right-1 !size-5 bg-red-500/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t('Settings.user.wallpaper.remove')}
                />
              )}

              {/* Selected indicator */}
              {selectedWallpaper === (wallpaper.isDefault ? null : wallpaper.filename) && (
                <Button
                  theme="pure"
                  size="s"
                  icon="assets/confirm.svg"
                  className="absolute top-1 left-1 !size-5 bg-blue-500 text-white"
                  title={t('General.selected')}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default WallpaperSelector

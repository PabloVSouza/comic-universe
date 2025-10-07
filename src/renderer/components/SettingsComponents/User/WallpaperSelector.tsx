import { useState, useEffect, createRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmIcon, cancelIcon, uploadIcon } from 'assets'
import { useApi } from 'hooks'
import wallpaperList, { ExtendedWallpaperInfo } from 'renderer-utils/wallpaperList'
import wallpaperManager from 'renderer-utils/wallpaperManager'
import { Item } from 'components/SettingsComponents'
import { confirmAlert, Button } from 'components/UiComponents'

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
    queryFn: () => wallpaperList.getAllWallpapers(),
    staleTime: 5 * 60 * 1000
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
      if (selectedWallpaper && selectedWallpaper.includes(filename)) {
        setSelectedWallpaper(null)
        onWallpaperChange(null)
      }
    }
  })

  const handleFileSelect = async () => {
    try {
      const result = await invoke<{ canceled: boolean; filePaths?: string[] }>('showOpenDialog', {
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

  const handleWallpaperSelect = (wallpaper: ExtendedWallpaperInfo) => {
    const wallpaperValue = wallpaper.isDefault ? null : wallpaper.filename
    setSelectedWallpaper(wallpaper.filename)
    onWallpaperChange(wallpaperValue)
  }

  const handleRemoveWallpaper = (filename: string) => {
    confirmAlert({
      title: t('Settings.user.wallpaper.remove'),
      message: t('Settings.user.wallpaper.removeConfirm'),
      buttons: [
        {
          label: t('General.cancel')
        },
        {
          label: t('General.yes'),
          action: () => removeWallpaper(filename)
        }
      ]
    })
  }

  const [wallpaperUrls, setWallpaperUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    setSelectedWallpaper(currentWallpaper || 'starry-sky')
  }, [currentWallpaper])

  useEffect(() => {
    const loadUrls = async () => {
      const urlPromises = wallpapers.map(async (wallpaper) => {
        const url = await wallpaperList.getWallpaperPreviewUrl(wallpaper)
        return { filename: wallpaper.filename, url }
      })

      const results = await Promise.all(urlPromises)
      const urlMap: Record<string, string> = {}
      results.forEach(({ filename, url }) => {
        urlMap[filename] = url
      })
      setWallpaperUrls(urlMap)
    }

    if (wallpapers.length > 0) {
      loadUrls()
    }
  }, [wallpapers])

  return (
    <div className="flex flex-col gap-4">
      <Item
        labelI18nKey="Settings.user.wallpaper.label"
        descriptionI18nKey="Settings.user.wallpaper.description"
      >
        <Button
          onClick={handleFileSelect}
          theme="pure"
          size="s"
          icon={uploadIcon}
          className="!size-10"
          title={t('Settings.user.wallpaper.addWallpaper')}
        />
      </Item>

      {}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-text-default opacity-70 py-4">
            {t('General.checking')}
          </div>
        ) : (
          <TransitionGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {wallpapers.map((wallpaper) => {
              const nodeRef = createRef<HTMLDivElement>()
              return (
                <CSSTransition
                  key={wallpaper.filename}
                  nodeRef={nodeRef}
                  timeout={300}
                  classNames="wallpaper-item"
                  appear={true}
                >
                  <div
                    ref={nodeRef}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedWallpaper === wallpaper.filename
                        ? 'border-text-default'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleWallpaperSelect(wallpaper)}
                  >
                    {wallpaperUrls[wallpaper.filename] ? (
                      <img
                        src={wallpaperUrls[wallpaper.filename]}
                        alt={wallpaper.filename}
                        className="w-full aspect-video object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+'
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
                      </div>
                    )}

                    {}
                    {selectedWallpaper === wallpaper.filename && (
                      <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <img src={confirmIcon} alt="Selected" className="w-3 h-3" />
                      </div>
                    )}

                    {}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2">
                        <p className="text-white text-xs truncate">
                          {wallpaperList.getWallpaperDisplayName(wallpaper, t)}
                        </p>
                      </div>
                    </div>

                    {}
                    {wallpaperList.canRemoveWallpaper(wallpaper) && (
                      <button
                        onClick={() => {
                          handleRemoveWallpaper(wallpaper.filename)
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title={t('Settings.user.wallpaper.remove')}
                      >
                        <img src={cancelIcon} alt="Remove" className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </CSSTransition>
              )
            })}
          </TransitionGroup>
        )}
      </div>
    </div>
  )
}

export default WallpaperSelector

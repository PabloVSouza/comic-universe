import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import LoadingOverlay from 'components/LoadingOverlay'
import SettingsItem from '../SettingsItem'
import WallpaperSelector from './WallpaperSelector'

const UserPreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [settings, setSettings] = useState<IUserSettings>({
    readingPreferences: {
      readingDirection: 'ltr'
    },
    displayPreferences: {
      theme: 'inherit',
      wallpaper: null
    },
    appPreferences: {
      language: 'inherit'
    }
  })

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['userSettings', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke('dbGetUserSettings', { userId: currentUser.id })
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newSettings: Partial<IUserSettings>) => {
      if (currentUser.id) {
        return await invoke('dbUpdateUserSettings', {
          userId: currentUser.id,
          settings: newSettings
        })
      }
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    }
  })

  useEffect(() => {
    if (userSettings) {
      setSettings((prev) => ({ ...prev, ...userSettings }))
    }
  }, [userSettings])

  const handleSettingChange = (
    category: keyof IUserSettings,
    key: string,
    value: string | null
  ) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    }
    setSettings(newSettings)
    updateSettings({ [category]: newSettings[category] })
  }

  if (!currentUser.id) {
    return (
      <div className="text-center text-text-default opacity-70 py-8">
        {t('Settings.user.noUserSelected')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay isLoading={isLoading} />

      <SettingsItem
        labelI18nKey="Settings.user.readingDirection"
        descriptionI18nKey="Settings.user.readingDirectionDescription"
      >
        <select
          value={settings.readingPreferences.readingDirection}
          onChange={(e) =>
            handleSettingChange('readingPreferences', 'readingDirection', e.target.value)
          }
          className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ltr">{t('Settings.user.ltr')}</option>
          <option value="rtl">{t('Settings.user.rtl')}</option>
        </select>
      </SettingsItem>

      <SettingsItem
        labelI18nKey="Settings.user.theme"
        descriptionI18nKey="Settings.user.themeDescription"
      >
        <select
          value={settings.displayPreferences.theme}
          onChange={(e) => handleSettingChange('displayPreferences', 'theme', e.target.value)}
          className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="inherit">{t('Settings.user.inherit')}</option>
          <option value="light">{t('Settings.user.light')}</option>
          <option value="dark">{t('Settings.user.dark')}</option>
          <option value="auto">{t('Settings.user.auto')}</option>
        </select>
      </SettingsItem>

      <SettingsItem
        labelI18nKey="Settings.user.language"
        descriptionI18nKey="Settings.user.languageDescription"
      >
        <select
          value={settings.appPreferences.language}
          onChange={(e) => handleSettingChange('appPreferences', 'language', e.target.value)}
          className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="inherit">{t('Settings.user.inherit')}</option>
          <option value="enUS">English</option>
          <option value="ptBR">Português</option>
        </select>
      </SettingsItem>

      {/* Wallpaper Selection */}
      <WallpaperSelector
        currentWallpaper={settings.displayPreferences.wallpaper}
        onWallpaperChange={(wallpaper) =>
          handleSettingChange('displayPreferences', 'wallpaper', wallpaper)
        }
      />
    </div>
  )
}

export default UserPreferences

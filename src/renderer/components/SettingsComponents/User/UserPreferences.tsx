import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { usePersistSessionStore } from 'store'
import { LoadingOverlay, Select, Button } from 'components/UiComponents'
import Item from '../Item'
import WallpaperSelector from './WallpaperSelector'

const UserPreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [settings, setSettings] = useState<IUserSettings>({
    readingPreferences: {
      readingDirection: 'ltr',
      defaultReadingMode: 'horizontal'
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
        return await invoke<IUserSettings | null>('dbGetUserSettings', { userId: currentUser.id })
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newSettings: Partial<IUserSettings>) => {
      if (currentUser.id) {
        return await invoke<void>('dbUpdateUserSettings', {
          userId: currentUser.id,
          settings: newSettings
        })
      }
      return null
    },
    onSuccess: (_, variables) => {
      setSettings((prev) => ({
        ...prev,
        ...variables
      }))
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    }
  })

  useEffect(() => {
    if (userSettings) {
      setSettings((prev) => {
        const merged: IUserSettings = {
          ...prev,
          ...userSettings,
          readingPreferences: { ...prev.readingPreferences, ...userSettings.readingPreferences },
          displayPreferences: { ...prev.displayPreferences, ...userSettings.displayPreferences },
          appPreferences: { ...prev.appPreferences, ...userSettings.appPreferences }
        }

        if (userSettings.syncPreferences || prev.syncPreferences) {
          merged.syncPreferences = {
            autoSync:
              userSettings.syncPreferences?.autoSync ?? prev.syncPreferences?.autoSync ?? true
          }
        }

        if (userSettings.websiteAuth || prev.websiteAuth) {
          merged.websiteAuth = {
            isConnected:
              userSettings.websiteAuth?.isConnected ?? prev.websiteAuth?.isConnected ?? false,
            websiteUrl: userSettings.websiteAuth?.websiteUrl ?? prev.websiteAuth?.websiteUrl,
            lastConnectedAt:
              userSettings.websiteAuth?.lastConnectedAt ?? prev.websiteAuth?.lastConnectedAt,
            deviceName: userSettings.websiteAuth?.deviceName ?? prev.websiteAuth?.deviceName
          }
        }

        return merged
      })
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

      <Item
        labelI18nKey="Settings.user.readingDirection"
        descriptionI18nKey="Settings.user.readingDirectionDescription"
      >
        <Select
          value={{
            value: settings.readingPreferences.readingDirection,
            label: t(`Settings.user.${settings.readingPreferences.readingDirection}`)
          }}
          onChange={(selected) =>
            handleSettingChange(
              'readingPreferences',
              'readingDirection',
              (selected as { value: string })?.value || null
            )
          }
          options={[
            { value: 'ltr', label: t('Settings.user.ltr') },
            { value: 'rtl', label: t('Settings.user.rtl') }
          ]}
        />
      </Item>

      <Item
        labelI18nKey="Settings.user.defaultReadingMode"
        descriptionI18nKey="Settings.user.defaultReadingModeDescription"
      >
        <Select
          value={{
            value: settings.readingPreferences.defaultReadingMode,
            label: t(`Settings.user.${settings.readingPreferences.defaultReadingMode}`)
          }}
          onChange={(selected) =>
            handleSettingChange(
              'readingPreferences',
              'defaultReadingMode',
              (selected as { value: string })?.value || null
            )
          }
          options={[
            { value: 'horizontal', label: t('Settings.user.horizontal') },
            { value: 'vertical', label: t('Settings.user.vertical') }
          ]}
        />
      </Item>

      <Item labelI18nKey="Settings.user.theme" descriptionI18nKey="Settings.user.themeDescription">
        <Select
          value={{
            value: settings.displayPreferences.theme,
            label: t(`Settings.user.${settings.displayPreferences.theme}`)
          }}
          onChange={(selected) =>
            handleSettingChange(
              'displayPreferences',
              'theme',
              (selected as { value: string })?.value || null
            )
          }
          options={[
            { value: 'inherit', label: t('Settings.user.inherit') },
            { value: 'light', label: t('Settings.user.light') },
            { value: 'dark', label: t('Settings.user.dark') },
            { value: 'auto', label: t('Settings.user.auto') }
          ]}
        />
      </Item>

      <Item
        labelI18nKey="Settings.user.language"
        descriptionI18nKey="Settings.user.languageDescription"
      >
        <Select
          value={{
            value: settings.appPreferences.language,
            label:
              settings.appPreferences.language === 'inherit'
                ? t('Settings.user.inherit')
                : settings.appPreferences.language === 'enUS'
                  ? 'English'
                  : 'Português'
          }}
          onChange={(selected) =>
            handleSettingChange(
              'appPreferences',
              'language',
              (selected as { value: string })?.value || null
            )
          }
          options={[
            { value: 'inherit', label: t('Settings.user.inherit') },
            { value: 'enUS', label: 'English' },
            { value: 'ptBR', label: 'Português' }
          ]}
        />
      </Item>

      {}
      <Item
        labelI18nKey="Settings.user.autoSync"
        descriptionI18nKey={
          settings.websiteAuth?.isConnected
            ? 'Settings.user.autoSyncDescription'
            : 'Settings.user.autoSyncDisabledDescription'
        }
      >
        <Button
          onClick={() => {
            const currentAutoSync = settings.syncPreferences?.autoSync ?? true
            const newAutoSync = !currentAutoSync

            const newSettings = {
              ...settings,
              syncPreferences: {
                ...settings.syncPreferences,
                autoSync: newAutoSync
              }
            }
            setSettings(newSettings)

            updateSettings({ syncPreferences: { autoSync: newAutoSync } })
          }}
          theme="toggle"
          active={settings.syncPreferences?.autoSync ?? true}
        />
      </Item>

      {}
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

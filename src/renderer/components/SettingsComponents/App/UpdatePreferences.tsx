import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApi } from 'hooks'
import { Item } from 'components/SettingsComponents'
import { Button } from 'components/UiComponents'

interface UpdateSettings {
  autoUpdate: boolean
  optInNonStable: boolean
  releaseTypes: string[]
}

const SettingsUpdatePreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()

  const [updateSettings, setUpdateSettings] = useState<UpdateSettings>({
    autoUpdate: true,
    optInNonStable: false,
    releaseTypes: ['stable']
  })
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    const loadUpdateSettings = async () => {
      try {
        const updateSettingsData = await invoke('getUpdateSettings')
        if (updateSettingsData) {
          setUpdateSettings(updateSettingsData as UpdateSettings)
        }
      } catch (error) {
        console.error('Error loading update settings:', error)
      }
    }

    const loadCurrentVersion = async () => {
      try {
        const version = await invoke('getAppVersion')
        setCurrentVersion(version as string)
      } catch (error) {
        console.error('Error loading version:', error)
        setCurrentVersion('Unknown')
      }
    }

    const loadPlatform = async () => {
      try {
        const platformData = await invoke('getPlatform')
        setPlatform(platformData as string)
      } catch (error) {
        console.error('Error loading platform:', error)
        setPlatform('unknown')
      }
    }

    loadUpdateSettings()
    loadCurrentVersion()
    loadPlatform()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveUpdateSettings = async (settings: UpdateSettings) => {
    try {
      await invoke('updateUpdateSettings', { updateSettings: settings })
    } catch (error) {
      console.error('Error saving update settings:', error)
    }
  }

  const handleAutoUpdateChange = async (checked: boolean) => {
    const newSettings = { ...updateSettings, autoUpdate: checked }
    setUpdateSettings(newSettings)
    await saveUpdateSettings(newSettings)
  }

  const handleOptInChange = async (checked: boolean) => {
    const newReleaseTypes = checked ? ['stable', 'beta', 'alpha'] : ['stable']
    const newSettings = {
      ...updateSettings,
      optInNonStable: checked,
      releaseTypes: newReleaseTypes
    }
    setUpdateSettings(newSettings)
    await saveUpdateSettings(newSettings)
  }

  return (
    <div className="space-y-6">
      {}
      <Item labelI18nKey="Settings.general.currentVersion">
        <div className="text-base bg-list-item text-text-default px-3 py-2 rounded-md">
          {currentVersion}
        </div>
      </Item>

      {}
      <Item
        label={t('Settings.update.autoUpdate.enable')}
        description={
          platform !== 'linux'
            ? platform === 'darwin'
              ? t('Settings.update.autoUpdate.notAvailableMacOS')
              : platform === 'win32'
                ? t('Settings.update.autoUpdate.notAvailableWindows')
                : t('Settings.update.autoUpdate.notAvailableOther')
            : t('Settings.update.autoUpdate.description')
        }
        className={platform !== 'linux' ? 'opacity-50' : ''}
      >
        <Button
          onClick={() => handleAutoUpdateChange(!updateSettings.autoUpdate)}
          disabled={platform !== 'linux'}
          theme="toggle"
          active={updateSettings.autoUpdate}
        />
      </Item>

      {}
      <Item
        label={t('Settings.update.nonStable.optIn')}
        description={
          platform !== 'linux'
            ? t('Settings.update.nonStable.notAvailableWhenAutoUpdateDisabled')
            : t('Settings.update.nonStable.description')
        }
        className={platform !== 'linux' ? 'opacity-50' : ''}
      >
        <Button
          onClick={() => handleOptInChange(!updateSettings.optInNonStable)}
          disabled={platform !== 'linux'}
          theme="toggle"
          active={updateSettings.optInNonStable}
        />
      </Item>
    </div>
  )
}

export default SettingsUpdatePreferences

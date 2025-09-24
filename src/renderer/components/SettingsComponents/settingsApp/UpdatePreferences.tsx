import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import useApi from 'api'
import Button from 'components/Button'
import refreshIcon from 'assets/refresh.svg'
import SettingsUpdatePreferences from './SettingsUpdatePreferences'

const UpdatePreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const [platform, setPlatform] = useState<string>('')

  const checkForUpdates = useMutation({
    mutationFn: async () => {
      return await invoke('checkForUpdates')
    },
    onSuccess: (data) => {
      console.log('Update check result:', data)
    },
    onError: (error) => {
      console.error('Error checking for updates:', error)
    }
  })

  // Load platform information
  useEffect(() => {
    const loadPlatform = async () => {
      try {
        const platformData = await invoke('getPlatform')
        setPlatform(platformData as string)
      } catch (error) {
        console.error('Error loading platform:', error)
        setPlatform('unknown')
      }
    }

    loadPlatform()
  }, []) // Remove invoke dependency to prevent infinite loop

  const handleCheckForUpdates = () => {
    checkForUpdates.mutate()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl text-text-default">{t('Settings.general.updatePreferences')}</h3>
        <Button
          onClick={handleCheckForUpdates}
          disabled={checkForUpdates.isPending || platform !== 'linux'}
          loading={checkForUpdates.isPending}
          icon={refreshIcon}
          size="icon"
          theme="pure"
          className={platform !== 'linux' ? 'opacity-50' : ''}
          title={
            checkForUpdates.isPending
              ? t('General.checking')
              : platform !== 'linux'
                ? platform === 'darwin'
                  ? t('Settings.update.autoUpdate.notAvailableMacOS')
                  : platform === 'win32'
                    ? t('Settings.update.autoUpdate.notAvailableWindows')
                    : t('Settings.update.autoUpdate.notAvailableOther')
                : t('Settings.general.checkForUpdates')
          }
        />
      </div>
      <SettingsUpdatePreferences />
    </div>
  )
}

export default UpdatePreferences

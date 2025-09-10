import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import useApi from 'api'
import Button from 'components/Button'
import refreshIcon from 'assets/refresh.svg'
import SettingsUpdatePreferences from './SettingsUpdatePreferences'

const UpdatePreferences = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()

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

  const handleCheckForUpdates = () => {
    checkForUpdates.mutate()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl text-text-default">{t('Settings.general.updatePreferences')}</h3>
        <Button
          onClick={handleCheckForUpdates}
          disabled={checkForUpdates.isPending}
          loading={checkForUpdates.isPending}
          icon={refreshIcon}
          size="icon"
          theme="pure"
          title={
            checkForUpdates.isPending
              ? t('General.checking')
              : t('Settings.general.checkForUpdates')
          }
        />
      </div>
      <SettingsUpdatePreferences />
    </div>
  )
}

export default UpdatePreferences

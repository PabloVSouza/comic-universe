import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const UserDataManagement = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const { currentUser } = usePersistSessionStore()

  const { data: readProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['userReadProgress', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke('dbGetReadProgressByUser', { userId: currentUser.id })
      }
      return []
    },
    enabled: !!currentUser.id,
    initialData: []
  })

  const { mutate: exportUserData } = useMutation({
    mutationFn: async () => {
      if (currentUser.id) {
        const userData = {
          user: currentUser,
          readProgress: readProgress,
          exportDate: new Date().toISOString()
        }
        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `comic-universe-user-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <SettingsItem
        labelI18nKey="Settings.user.exportData"
        descriptionI18nKey="Settings.user.exportDataDescription"
      >
        <Button
          onClick={() => exportUserData()}
          theme="default"
          size="m"
          className="min-w-[140px]"
          disabled={!currentUser.id || progressLoading}
        >
          {t('Settings.user.exportData')}
        </Button>
      </SettingsItem>
    </div>
  )
}

export default UserDataManagement

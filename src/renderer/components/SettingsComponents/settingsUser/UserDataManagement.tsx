import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const UserDataManagement = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser, setCurrentUser } = usePersistSessionStore()

  const { data: users } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => await invoke('dbGetAllUsers'),
    initialData: []
  })

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

  const { mutate: deleteUser } = useMutation({
    mutationFn: async (userId: number) => await invoke('dbDeleteUser', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] })
      // If we deleted the current user, set to default user or first available
      if (currentUser.id === users.find((u) => u.id === currentUser.id)?.id) {
        const remainingUsers = users.filter((u) => u.id !== currentUser.id)
        if (remainingUsers.length > 0) {
          setCurrentUser(remainingUsers[0])
        }
      }
    }
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

  const handleDeleteUser = () => {
    if (currentUser.id && window.confirm(t('Settings.user.deleteUser.confirm'))) {
      deleteUser(currentUser.id)
    }
  }

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

      <SettingsItem
        labelI18nKey="Settings.user.deleteUser"
        descriptionI18nKey="Settings.user.deleteUserDescription"
      >
        <Button
          onClick={handleDeleteUser}
          theme="default"
          color="red"
          size="m"
          className="min-w-[140px]"
          disabled={!currentUser.id || currentUser.default}
        >
          {t('Settings.user.deleteUser')}
        </Button>
      </SettingsItem>
    </div>
  )
}

export default UserDataManagement

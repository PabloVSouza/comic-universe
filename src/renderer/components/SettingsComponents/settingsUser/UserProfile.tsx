import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'

const UserProfile = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const { mutate: updateUser } = useMutation({
    mutationFn: async (userData: { id: number; name: string }) =>
      await invoke('dbUpdateUser', { user: userData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] })
      setIsEditing(false)
    }
  })

  useEffect(() => {
    if (currentUser.name) {
      setEditName(currentUser.name)
    }
  }, [currentUser.name])

  const handleSaveEdit = () => {
    if (currentUser.id && editName.trim()) {
      updateUser({ id: currentUser.id, name: editName.trim() })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsItem
        labelI18nKey="Settings.user.currentUser"
        descriptionI18nKey="Settings.user.currentUserDescription"
      >
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('Settings.user.namePlaceholder')}
              />
              <Button
                onClick={handleSaveEdit}
                theme="pure"
                size="s"
                disabled={!editName.trim()}
                icon="assets/confirm.svg"
                className="!size-7"
                title={t('General.save')}
              />
              <Button
                onClick={() => setIsEditing(false)}
                theme="pure"
                size="s"
                icon="assets/cancel.svg"
                className="!size-7"
                title={t('General.cancel')}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-list-item text-text-default rounded-lg border border-gray-200 dark:border-gray-600">
                {currentUser.name || t('Settings.user.noUserSelected')}
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                theme="pure"
                size="s"
                disabled={!currentUser.id}
                icon="assets/pencil.svg"
                className="!size-7"
                title={t('General.edit')}
              />
            </div>
          )}
        </div>
      </SettingsItem>
    </div>
  )
}

export default UserProfile

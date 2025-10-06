import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { confirmIcon, cancelIcon, pencilIcon } from 'assets'
import { Button } from 'components/ui'
import { DisplayValue } from 'components/ui'
import { Input } from 'components/ui'
import usePersistSessionStore from 'store/usePersistSessionStore'
import SettingsItem from '../SettingsItem'
import WebsiteAuth from './WebsiteAuth'

const UserProfile = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const { mutate: updateUser } = useMutation({
    mutationFn: async (userData: { id: string; name: string }) =>
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
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t('Settings.user.namePlaceholder')}
              />
              <Button
                onClick={handleSaveEdit}
                theme="pure"
                size="s"
                disabled={!editName.trim()}
                icon={confirmIcon}
                className="!size-7"
                title={t('General.save')}
              />
              <Button
                onClick={() => setIsEditing(false)}
                theme="pure"
                size="s"
                icon={cancelIcon}
                className="!size-7"
                title={t('General.cancel')}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DisplayValue>{currentUser.name || t('Settings.user.noUserSelected')}</DisplayValue>
              <Button
                onClick={() => setIsEditing(true)}
                theme="pure"
                size="s"
                disabled={!currentUser.id}
                icon={pencilIcon}
                className="!size-7"
                title={t('General.edit')}
              />
            </div>
          )}
        </div>
      </SettingsItem>

      <WebsiteAuth />
    </div>
  )
}

export default UserProfile

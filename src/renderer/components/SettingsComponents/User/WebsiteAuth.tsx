import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { openWindow } from 'functions'
import { useApi } from 'hooks'
import { usePersistSessionStore, useUserSettingsStore } from 'store'
import { Item } from 'components/SettingsComponents'
import { Button } from 'components/UiComponents'

const WebsiteAuth = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const {
    deviceName,
    generateDeviceName,
    disconnectFromWebsite: disconnectFromWebsiteStore
  } = useUserSettingsStore()

  useEffect(() => {
    generateDeviceName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data: websiteAuth, isLoading } = useQuery({
    queryKey: ['websiteAuth', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke<{ token?: string; isExpired?: boolean } | null>(
          'dbGetWebsiteAuthToken',
          { userId: currentUser.id }
        )
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  const handleConnectClick = () => {
    openWindow({
      component: 'WebsiteAuth',
      props: { deviceName: deviceName || 'Unknown Device' }
    })
  }

  const handleDisconnectClick = () => {
    if (!currentUser.id) return

    disconnectFromWebsiteStore(currentUser.id, invoke, (queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  }

  if (isLoading) {
    return (
      <Item
        labelI18nKey="Settings.user.websiteAuth.title"
        descriptionI18nKey="Settings.user.websiteAuth.description"
      >
        <div className="text-sm text-gray-500">Loading...</div>
      </Item>
    )
  }

  const isConnected = websiteAuth?.token && !websiteAuth?.isExpired

  return (
    <Item
      labelI18nKey="Settings.user.websiteAuth.title"
      descriptionI18nKey="Settings.user.websiteAuth.description"
    >
      <div className="flex flex-col gap-4">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {isConnected
                ? t('Settings.user.websiteAuth.connected')
                : t('Settings.user.websiteAuth.notConnected')}
            </span>
          </div>
        </div>

        {}

        {}
        <div className="flex gap-2 justify-end pt-2">
          {isConnected ? (
            <Button
              onClick={handleDisconnectClick}
              theme="secondary"
              size="l"
              disabled={!currentUser.id}
            >
              {t('Settings.user.websiteAuth.disconnect')}
            </Button>
          ) : (
            <Button
              onClick={handleConnectClick}
              theme="primary"
              size="l"
              disabled={!currentUser.id}
            >
              {t('Settings.user.websiteAuth.connect')}
            </Button>
          )}
        </div>
      </div>
    </Item>
  )
}

export default WebsiteAuth

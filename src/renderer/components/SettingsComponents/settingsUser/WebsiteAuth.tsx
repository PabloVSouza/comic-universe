import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import Button from 'components/Button'
import SettingsItem from '../SettingsItem'
import openWindow from 'functions/openWindow'

const WebsiteAuth = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [deviceName, setDeviceName] = useState('')

  // Automatically generate device name
  useEffect(() => {
    const generateDeviceName = () => {
      try {
        // Try to get platform information
        const userAgent = navigator.userAgent || ''

        // Extract OS information
        let os = 'Unknown OS'
        if (userAgent.includes('Windows')) os = 'Windows'
        else if (userAgent.includes('Mac')) os = 'macOS'
        else if (userAgent.includes('Linux')) os = 'Linux'

        // Generate a simple device name
        const deviceName = `${os} Device`
        setDeviceName(deviceName)
      } catch (error) {
        console.error('Failed to generate device name:', error)
        setDeviceName('Comic Universe App')
      }
    }

    generateDeviceName()
  }, [])

  // Get current website auth status
  const { data: websiteAuth, isLoading } = useQuery({
    queryKey: ['websiteAuth', currentUser.id],
    queryFn: async () => {
      if (currentUser.id) {
        return await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })
      }
      return null
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  // Disconnect from website mutation
  const { mutate: disconnectFromWebsite } = useMutation({
    mutationFn: async () => {
      if (!currentUser.id) throw new Error('No user selected')

      await invoke('dbClearWebsiteAuthToken', { userId: currentUser.id })

      // Also update user settings to reflect disconnection
      const currentSettings = await invoke('dbGetUserSettings', { userId: currentUser.id })
      const updatedSettings = {
        ...currentSettings,
        websiteAuth: {
          ...currentSettings.websiteAuth,
          isConnected: false,
          lastConnectedAt: undefined
        }
      }
      await invoke('dbUpdateUserSettings', { userId: currentUser.id, settings: updatedSettings })
    },
    onSuccess: () => {
      // Refresh website auth status
      queryClient.invalidateQueries({ queryKey: ['websiteAuth', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    },
    onError: (error) => {
      console.error('Disconnection error:', error)
      // TODO: Show error toast
    }
  })

  const handleConnectClick = () => {
    openWindow({
      component: 'WebsiteAuth',
      props: { deviceName: deviceName || 'Unknown Device' }
    })
  }

  const handleDisconnectClick = () => {
    disconnectFromWebsite()
  }

  if (isLoading) {
    return (
      <SettingsItem
        labelI18nKey="Settings.user.websiteAuth.title"
        descriptionI18nKey="Settings.user.websiteAuth.description"
      >
        <div className="text-sm text-gray-500">Loading...</div>
      </SettingsItem>
    )
  }

  const isConnected = websiteAuth?.token && !websiteAuth?.isExpired

  return (
    <SettingsItem
      labelI18nKey="Settings.user.websiteAuth.title"
      descriptionI18nKey="Settings.user.websiteAuth.description"
    >
      <div className="flex flex-col gap-4">
        {/* Connection Status */}
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

        {/* Connected Info - Device name removed */}

        {/* Action Buttons */}
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
    </SettingsItem>
  )
}

export default WebsiteAuth

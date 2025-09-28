import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import Button from 'components/Button'
import Input from 'components/Input'
import SettingsItem from '../SettingsItem'
import DisplayValue from 'components/DisplayValue'
import { shell } from 'electron'

interface WebsiteAuthData {
  token: string | null
  expiresAt: string | null
  deviceName: string | null
  isExpired: boolean
}

const WebsiteAuth = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  const [isConnecting, setIsConnecting] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('https://comicuniverse.com')
  const [deviceName, setDeviceName] = useState('')

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

  // Connect to website mutation
  const { mutate: connectToWebsite } = useMutation({
    mutationFn: async () => {
      if (!currentUser.id) throw new Error('No user selected')
      
      setIsConnecting(true)
      
      try {
        // Open website in browser with connect flow
        const connectUrl = `${websiteUrl}/auth/app-connect?userId=${currentUser.id}&deviceName=${encodeURIComponent(deviceName || 'Unknown Device')}`
        await shell.openExternal(connectUrl)
        
        // Wait for user to complete authentication on website
        // This is a simplified approach - in a real implementation, you might want to use
        // a more sophisticated method like polling or webhooks
        
        return { success: true }
      } catch (error) {
        console.error('Failed to connect to website:', error)
        throw error
      } finally {
        setIsConnecting(false)
      }
    },
    onSuccess: () => {
      // Refresh website auth status
      queryClient.invalidateQueries({ queryKey: ['websiteAuth', currentUser.id] })
    },
    onError: (error) => {
      console.error('Connection error:', error)
    }
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
          ...currentSettings?.websiteAuth,
          isConnected: false,
          lastConnectedAt: undefined
        }
      }
      await invoke('dbUpdateUserSettings', { userId: currentUser.id, settings: updatedSettings })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteAuth', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    }
  })

  // Set website auth token (called from external source)
  const { mutate: setWebsiteAuthToken } = useMutation({
    mutationFn: async ({ token, expiresAt, deviceName }: {
      token: string
      expiresAt: string
      deviceName: string
    }) => {
      if (!currentUser.id) throw new Error('No user selected')
      
      await invoke('dbSetWebsiteAuthToken', {
        userId: currentUser.id,
        token,
        expiresAt,
        deviceName
      })
      
      // Update user settings to reflect connection
      const currentSettings = await invoke('dbGetUserSettings', { userId: currentUser.id })
      const updatedSettings = {
        ...currentSettings,
        websiteAuth: {
          ...currentSettings?.websiteAuth,
          isConnected: true,
          websiteUrl,
          lastConnectedAt: new Date().toISOString(),
          deviceName
        }
      }
      await invoke('dbUpdateUserSettings', { userId: currentUser.id, settings: updatedSettings })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteAuth', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    }
  })

  // Load device name from stored auth data
  useEffect(() => {
    if (websiteAuth?.deviceName) {
      setDeviceName(websiteAuth.deviceName)
    }
  }, [websiteAuth])

  const isConnected = websiteAuth?.token && !websiteAuth?.isExpired
  const lastConnectedDate = websiteAuth?.expiresAt ? new Date(websiteAuth.expiresAt).toLocaleDateString() : null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <SettingsItem
          labelI18nKey="Settings.user.websiteAuth.title"
          descriptionI18nKey="Settings.user.websiteAuth.description"
        >
          <DisplayValue>Loading...</DisplayValue>
        </SettingsItem>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsItem
        labelI18nKey="Settings.user.websiteAuth.title"
        descriptionI18nKey="Settings.user.websiteAuth.description"
      >
        <div className="flex flex-col gap-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <DisplayValue>
                {isConnected ? t('Settings.user.websiteAuth.connected') : t('Settings.user.websiteAuth.notConnected')}
              </DisplayValue>
              {lastConnectedDate && (
                <span className="text-sm text-gray-500">
                  {t('Settings.user.websiteAuth.lastConnected')}: {lastConnectedDate}
                </span>
              )}
              {websiteAuth?.isExpired && (
                <span className="text-sm text-red-500">
                  {t('Settings.user.websiteAuth.tokenExpired')}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {isConnected ? (
                <Button
                  onClick={() => disconnectFromWebsite()}
                  theme="danger"
                  size="s"
                  disabled={!currentUser.id}
                >
                  {t('Settings.user.websiteAuth.disconnect')}
                </Button>
              ) : (
                <Button
                  onClick={() => connectToWebsite()}
                  theme="primary"
                  size="s"
                  disabled={!currentUser.id || isConnecting}
                >
                  {isConnecting ? 'Connecting...' : t('Settings.user.websiteAuth.connect')}
                </Button>
              )}
            </div>
          </div>

          {/* Configuration (only show when not connected) */}
          {!isConnected && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Settings.user.websiteAuth.websiteUrl')}
                </label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={t('Settings.user.websiteAuth.websiteUrlPlaceholder')}
                  disabled={isConnecting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Settings.user.websiteAuth.deviceName')}
                </label>
                <Input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t('Settings.user.websiteAuth.deviceNamePlaceholder')}
                  disabled={isConnecting}
                />
              </div>
            </div>
          )}

          {/* Connected Info */}
          {isConnected && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div><strong>{t('Settings.user.websiteAuth.deviceName')}:</strong> {websiteAuth?.deviceName || 'Unknown'}</div>
                <div><strong>{t('Settings.user.websiteAuth.websiteUrl')}:</strong> {websiteUrl}</div>
              </div>
            </div>
          )}
        </div>
      </SettingsItem>
    </div>
  )
}

export default WebsiteAuth

import { FC, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { getApiBaseUrl } from 'shared/constants'
import { usePersistSessionStore, useWindowManagerStore } from 'store'
import { Box, Title } from 'components/SettingsComponents'
import { Button, Input } from 'components/UiComponents'

const WebsiteAuth: FC = () => {
  const { t } = useTranslation()
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const { removeWindow } = useWindowManagerStore()

  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceName, setDeviceName] = useState('')

  const websiteUrl = getApiBaseUrl(process.env.NODE_ENV === 'development')

  useEffect(() => {
    const generateDeviceName = () => {
      try {
        const userAgent = navigator.userAgent || ''

        let os = 'Unknown OS'
        if (userAgent.includes('Windows')) os = 'Windows'
        else if (userAgent.includes('Mac')) os = 'macOS'
        else if (userAgent.includes('Linux')) os = 'Linux'

        const deviceName = `${os} Device`
        setDeviceName(deviceName)
      } catch (error) {
        console.error('Failed to generate device name:', error)
        setDeviceName('Comic Universe App')
      }
    }

    generateDeviceName()
  }, [])

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: async ({ value }) => {
      connectToWebsite({ email: value.email, password: value.password })
    }
  })

  const { mutate: connectToWebsite } = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (!currentUser.id) throw new Error('No user selected')

      setIsConnecting(true)

      try {
        const response = await fetch(`${websiteUrl}/api/auth/app-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            userId: currentUser.id,
            deviceName: deviceName || 'Unknown Device'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Authentication failed')
        }

        const data = await response.json()

        const authResult = await invoke<{
          userId: string
          userIdChanged: boolean
        }>('dbSetWebsiteAuthToken', {
          userId: currentUser.id,
          token: data.token,
          expiresAt: data.expiresAt,
          deviceName: deviceName || 'Unknown Device'
        })

        return {
          success: true,
          token: data.token,
          newUserId: authResult?.userId || currentUser.id,
          userIdChanged: authResult?.userIdChanged || false
        }
      } catch (error) {
        console.error('Failed to connect to website:', error)
        throw error
      } finally {
        setIsConnecting(false)
      }
    },
    onSuccess: (data) => {
      if (data.userIdChanged && data.newUserId) {
        const { setCurrentUser } = usePersistSessionStore.getState()
        setCurrentUser({ ...currentUser, id: data.newUserId })

        queryClient.removeQueries()
      } else {
        queryClient.invalidateQueries()
      }

      const currentWindows = useWindowManagerStore.getState().currentWindows
      const websiteAuthWindow = currentWindows.find(
        (window) => window.component.name === 'WebsiteAuth'
      )
      if (websiteAuthWindow) {
        removeWindow(websiteAuthWindow.id)
      }
    },
    onError: (error) => {
      console.error('Failed to connect to website:', error)
    }
  })

  const handleCancel = () => {
    const currentWindows = useWindowManagerStore.getState().currentWindows
    const websiteAuthWindow = currentWindows.find(
      (window) => window.component.name === 'WebsiteAuth'
    )
    if (websiteAuthWindow) {
      removeWindow(websiteAuthWindow.id)
    }
  }

  return (
    <div className="h-full w-full flex flex-col relative">
      <Title i18nKey="Settings.user.websiteAuth.title" variant="main" />

      <div className="flex-1 overflow-y-auto pt-20 p-6">
        <div className="mx-auto max-w-md space-y-6">
          <Box>
            <Title i18nKey="Settings.user.websiteAuth.connect" variant="section" />
            <p className="text-sm text-text-default opacity-70 mb-4">
              {t('Settings.user.websiteAuth.description')}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? t('Settings.user.websiteAuth.emailRequired')
                      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? t('Settings.user.websiteAuth.emailInvalid')
                        : undefined
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-base text-text-default mb-2">Email</label>
                    <Input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t('Settings.user.websiteAuth.emailPlaceholder')}
                      disabled={isConnecting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? t('Settings.user.websiteAuth.passwordRequired')
                      : value.length < 6
                        ? t('Settings.user.websiteAuth.passwordMinLength')
                        : undefined
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-base text-text-default mb-2">Password</label>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t('Settings.user.websiteAuth.passwordPlaceholder')}
                      disabled={isConnecting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  theme="secondary"
                  size="m"
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  theme="primary"
                  size="l"
                  disabled={isConnecting || !form.state.isValid}
                >
                  {isConnecting
                    ? t('Settings.user.websiteAuth.connecting')
                    : t('Settings.user.websiteAuth.connect')}
                </Button>
              </div>
            </form>
          </Box>
        </div>
      </div>
    </div>
  )
}

const getWindowSettings = () => {
  return {
    windowProps: {
      className: 'overflow-auto',
      contentClassName: 'size-full',
      titleBar: true,
      closeable: true,
      unique: true,
      title: 'Website Authentication'
    },
    initialStatus: {
      startPosition: 'center',
      width: 500,
      height: 600
    }
  } as TWindow
}

export default { WebsiteAuth, ...getWindowSettings() }

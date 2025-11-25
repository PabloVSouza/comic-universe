import { useEffect } from 'react'
import { confirmAlert } from 'components/UiComponents'
import usePersistSessionStore from 'store/usePersistSessionStore'
import { ApiList, getDefaultImplementation } from './useApi'

export interface DeepLinkData {
  action: string
  type?: string
  url?: string
  name?: string
  id?: string
  data?: Record<string, unknown>
}

export const useDeepLink = (callback: (data: DeepLinkData) => void): (() => void) | undefined => {
  useEffect(() => {
    const electronWindow = window as unknown as { Electron?: Record<string, unknown> }
    const electronAPI = electronWindow.Electron
    if (!electronAPI || typeof electronAPI !== 'object' || !('deepLink' in electronAPI)) {
      console.warn('Deep link API not available. Running in non-Electron environment?')
      return
    }

    const deepLink = electronAPI.deepLink as Record<string, unknown>

    if (typeof deepLink.notifyReady === 'function') {
      deepLink.notifyReady()
    }

    const unsubscribe =
      typeof deepLink.onDeepLink === 'function'
        ? deepLink.onDeepLink((data: DeepLinkData) => {
            console.log('Deep link received in React:', data)
            callback(data)
          })
        : undefined

    return unsubscribe
  }, [callback])

  return undefined
}

export const handleDeepLinkAction = async (data: DeepLinkData): Promise<void> => {
  console.log(`Handling deep link action: ${data.type}/${data.action}`, data)

  try {
    switch (data.type) {
      case 'plugin':
        await handlePluginDeepLink(data)
        break
      case 'comic':
        await handleComicDeepLink(data)
        break
      case 'chapter':
        await handleChapterDeepLink(data)
        break
      default:
        console.warn(`Unknown deep link type: ${data.type}`)
    }
  } catch (error) {
    console.error('Error in handleDeepLinkAction:', error)
    throw error
  }
}

const handlePluginDeepLink = async (data: DeepLinkData): Promise<void> => {
  const { action, url, name, id } = data

  const selectedImplementation = getDefaultImplementation()
  const invoke = ApiList[selectedImplementation].invoke
  const { currentUser } = usePersistSessionStore.getState()
  
  if (!currentUser?.id) {
    console.error('User not logged in')
    return
  }
  
  const userId = currentUser.id

  switch (action) {
    case 'install': {
      if (!url) {
        console.error('Plugin URL is required for installation')
        return
      }

      const tag =
        (data.data?.tag as string) ||
        (name ? name.toLowerCase().replace(/\s+/g, '-') : new URL(url).hostname.replace(/\./g, '-'))

      const pluginName = name || tag
      const pluginDescription = (data.data?.description as string) || undefined

      const messageParts = [`Do you want to install "${pluginName}"?`, `\nURL: ${url}`]

      if (pluginDescription) {
        messageParts.push(`\n\n${pluginDescription}`)
      }

      console.log('Showing install confirmation alert for plugin:', pluginName)

      const showInstallAlert = () => {
        try {
          confirmAlert({
            title: 'Install Plugin',
            message: messageParts.join(''),
            buttons: [
              {
                label: 'Cancel',
                action: () => {
                  console.log('Plugin installation cancelled')
                }
              },
              {
                label: 'Install',
                action: async () => {
                  try {
                    console.log(`Installing plugin: ${pluginName} from ${url}`)

                    const plugin = {
                      name: pluginName,
                      url: url,
                      tag: tag,
                      logo: (data.data?.logo as string) || undefined,
                      description: pluginDescription,
                      enabled: true
                    }

                    await invoke('createPlugin', { plugin, userId })

                    await invoke('refreshPluginHandlers', { userId })

                    console.log(`Plugin ${plugin.name} installed successfully`)

                    setTimeout(() => {
                      confirmAlert({
                        title: 'Plugin Installed',
                        message: `"${pluginName}" has been installed successfully.`
                      })
                    }, 100)
                  } catch (error) {
                    console.error('Error installing plugin:', error)
                    setTimeout(() => {
                      confirmAlert({
                        title: 'Installation Failed',
                        message: `Failed to install plugin: ${error instanceof Error ? error.message : 'Unknown error'}`
                      })
                    }, 100)
                  }
                }
              }
            ]
          })
        } catch (error) {
          console.error('Error showing confirmAlert:', error)
          setTimeout(showInstallAlert, 100)
        }
      }

      setTimeout(showInstallAlert, 100)
      break
    }

    case 'enable':
    case 'activate': {
      if (!id) {
        console.error('Plugin ID is required for enabling')
        return
      }

      try {
        console.log(`Enabling plugin: ${id}`)
        await invoke('updatePlugin', {
          id: parseInt(id, 10),
          plugin: { enabled: true },
          userId
        })
        await invoke('refreshPluginHandlers', { userId })
        console.log(`Plugin ${id} enabled successfully`)
      } catch (error) {
        console.error('Error enabling plugin:', error)
      }
      break
    }

    case 'disable': {
      if (!id) {
        console.error('Plugin ID is required for disabling')
        return
      }

      try {
        console.log(`Disabling plugin: ${id}`)
        await invoke('updatePlugin', {
          id: parseInt(id, 10),
          plugin: { enabled: false },
          userId
        })
        await invoke('refreshPluginHandlers', { userId })
        console.log(`Plugin ${id} disabled successfully`)
      } catch (error) {
        console.error('Error disabling plugin:', error)
      }
      break
    }

    default:
      console.warn(`Unknown plugin action: ${action}`)
  }
}

const handleComicDeepLink = async (data: DeepLinkData): Promise<void> => {
  const { action, url, name, id } = data

  switch (action) {
    case 'add':
    case 'import':
      console.log(`Adding comic: ${name} from ${url}`)
      break

    case 'open':
      console.log(`Opening comic: ${id || name}`)
      break

    default:
      console.warn(`Unknown comic action: ${action}`)
  }
}

const handleChapterDeepLink = async (data: DeepLinkData): Promise<void> => {
  const { action } = data

  switch (action) {
    case 'read':
      console.log(`Reading chapter: ${data.data?.chapterId}`)
      break

    case 'download':
      console.log(`Downloading chapter: ${data.data?.chapterId}`)
      break

    default:
      console.warn(`Unknown chapter action: ${action}`)
  }
}

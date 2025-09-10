import { useEffect } from 'react'
import { confirmAlert } from 'components/Alert'
import useApi from 'api'

interface UpdateNotificationProps {
  // This component doesn't need props, it listens to IPC messages
}

const UpdateNotification = ({}: UpdateNotificationProps) => {
  const { invoke, on, removeAllListeners } = useApi()

  useEffect(() => {
    // Listen for manual update notifications (macOS/Windows)
    const handleManualUpdate = (...args: unknown[]) => {
      const data = args[1] as {
        version: string
        platform: string
        message: string
        detail: string
      }
      confirmAlert({
        title: 'Update Available',
        message: data.message,
        buttons: [
          {
            label: 'Open Releases Page',
            action: async () => {
              // Open GitHub releases page using API layer
              await invoke('openExternal', { url: 'https://github.com/PabloVSouza/comic-universe/releases' })
            }
          },
          {
            label: 'OK',
            action: () => {
              // Just close the dialog
            }
          }
        ]
      })
    }

    // Listen for auto update notifications (Linux)
    const handleAutoUpdate = (...args: unknown[]) => {
      const data = args[1] as {
        version: string
        message: string
        detail: string
      }
      confirmAlert({
        title: 'Update Available',
        message: data.message,
        buttons: [
          {
            label: 'OK',
            action: () => {
              // Just close the dialog
            }
          }
        ]
      })
    }

    // Register IPC listeners using API layer
    on('update-available-manual', handleManualUpdate)
    on('update-available-auto', handleAutoUpdate)

    // Cleanup listeners on unmount
    return () => {
      removeAllListeners('update-available-manual')
      removeAllListeners('update-available-auto')
    }
  }, [invoke, on, removeAllListeners])

  // This component doesn't render anything, it just handles IPC messages
  return null
}

export default UpdateNotification

import { useEffect } from 'react'
import { confirmAlert } from 'components/Alert'
import { useTranslation } from 'react-i18next'
import useApi from 'api'

interface UpdateNotificationProps {
  // This component doesn't need props, it listens to IPC messages
}

const UpdateNotification = ({}: UpdateNotificationProps) => {
  const { t } = useTranslation()
  const { invoke } = useApi()

  useEffect(() => {
    // Listen for manual update notifications (macOS/Windows)
    const handleManualUpdate = (event: any, data: {
      version: string
      platform: string
      message: string
      detail: string
    }) => {
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
    const handleAutoUpdate = (event: any, data: {
      version: string
      message: string
      detail: string
    }) => {
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
    if (window.Electron?.ipcRenderer) {
      window.Electron.ipcRenderer.on('update-available-manual', handleManualUpdate)
      window.Electron.ipcRenderer.on('update-available-auto', handleAutoUpdate)
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.Electron?.ipcRenderer) {
        window.Electron.ipcRenderer.removeAllListeners('update-available-manual')
        window.Electron.ipcRenderer.removeAllListeners('update-available-auto')
      }
    }
  }, [invoke])

  // This component doesn't render anything, it just handles IPC messages
  return null
}

export default UpdateNotification

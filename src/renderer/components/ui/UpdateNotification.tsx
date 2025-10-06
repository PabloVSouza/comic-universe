import { useEffect } from 'react'
import useApi from 'api'
import { confirmAlert } from './Alert'

const UpdateNotification = () => {
  const { invoke, on, removeAllListeners } = useApi()

  useEffect(() => {
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
              await invoke('openExternal', {
                url: 'https://github.com/PabloVSouza/comic-universe/releases'
              })
            }
          },
          {
            label: 'OK',
            action: () => {}
          }
        ]
      })
    }

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
            action: () => {}
          }
        ]
      })
    }

    on('update-available-manual', handleManualUpdate)
    on('update-available-auto', handleAutoUpdate)

    return () => {
      removeAllListeners('update-available-manual')
      removeAllListeners('update-available-auto')
    }
  }, [invoke, on, removeAllListeners])

  return null
}

export default UpdateNotification

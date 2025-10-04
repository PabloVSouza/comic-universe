import { FC, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { confirmAlert } from 'components/Alert'
import Button from 'components/Button'
import openWindow from 'functions/openWindow'
import usePersistSessionStore from 'store/usePersistSessionStore'
import { downloadIcon, refreshIcon } from 'assets/index'

export const HomeComicNav: FC = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    console.log('Sync button clicked - using new SyncService')
    console.log('Current user:', currentUser)

    if (!currentUser?.id) {
      confirmAlert({
        title: 'No User Found',
        message: 'Please log in first.',
        buttons: [{ label: 'OK' }]
      })
      return
    }

    setIsSyncing(true)

    try {
      // Get the website auth token
      const websiteAuth = await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })

      if (!websiteAuth?.token || websiteAuth.isExpired) {
        confirmAlert({
          title: 'Authentication Required',
          message: 'Please connect to your website account to sync.',
          buttons: [
            { label: 'Cancel' },
            {
              label: 'Connect',
              action: () => openWindow({ component: 'WebsiteAuth', props: {} })
            }
          ]
        })
        setIsSyncing(false)
        return
      }

      // Call the new sync service with 'bidirectional' to sync both ways
      const result = await invoke('dbSyncData', {
        direction: 'bidirectional',
        userId: currentUser.id,
        token: websiteAuth.token
      })

      console.log('Sync result:', result)
      console.log('Sync errors:', result.errors)

      if (result.success) {
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['comics'] })
        queryClient.invalidateQueries({ queryKey: ['readProgress'] })

        confirmAlert({
          title: 'Sync Complete',
          message: `Successfully synced ${result.entriesProcessed} items between app and website.`,
          buttons: [{ label: 'OK' }]
        })
      } else {
        const errorDetails =
          result.errors.length > 0
            ? result.errors.join('\n')
            : 'An unknown error occurred during sync.'
        console.error('Sync failed with errors:', errorDetails)

        confirmAlert({
          title: 'Sync Failed',
          message: errorDetails,
          buttons: [{ label: 'OK' }]
        })
      }
    } catch (error) {
      console.error('Sync error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('authentication')) {
        confirmAlert({
          title: 'Authentication Required',
          message: 'Please connect to your website account to sync.',
          buttons: [
            { label: 'Cancel' },
            {
              label: 'Connect',
              action: () => openWindow({ component: 'WebsiteAuth', props: {} })
            }
          ]
        })
      } else {
        confirmAlert({
          title: 'Sync Error',
          message: errorMessage,
          buttons: [{ label: 'OK' }]
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <ul className="bg-default">
      <li className="flex justify-between items-center p-2 w-60">
        <Button
          className="z-30 h-full"
          icon={downloadIcon}
          size="xs"
          theme="pure"
          onClick={() => openWindow({ component: 'Search', props: {} })}
        />
        <Button
          className="z-30 h-full p-2"
          icon={refreshIcon}
          size="xs"
          theme="pure"
          onClick={handleSync}
          disabled={isSyncing}
          loading={isSyncing}
          loadingAnimation="spin-reverse"
        />
      </li>
    </ul>
  )
}

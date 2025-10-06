import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { openWindow } from 'functions'
import { useApi } from 'hooks'
import { confirmAlert } from 'components/ui'
import usePersistSessionStore from 'store/usePersistSessionStore'

interface SyncResult {
  success: boolean
  entriesProcessed: number
  conflicts?: unknown[]
}

const useWebsiteSync = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const { t } = useTranslation()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSync = async () => {
    if (!currentUser?.id) {
      confirmAlert({
        title: t('HomeNav.sync.noUserTitle'),
        message: t('HomeNav.sync.noUserMessage'),
        buttons: [{ label: t('HomeNav.sync.okButton') }]
      })
      return
    }

    setIsSyncing(true)

    try {
      // Get website authentication token
      const websiteAuth = await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })

      // Check if user is authenticated
      if (!websiteAuth?.token || websiteAuth.isExpired) {
        confirmAlert({
          title: t('Settings.user.websiteAuth.syncRequired'),
          message: t('Settings.user.websiteAuth.syncRequiredMessage'),
          buttons: [
            { label: t('Settings.user.websiteAuth.cancelButton') },
            {
              label: t('Settings.user.websiteAuth.connectToSync'),
              action: () => openWindow({ component: 'WebsiteAuth', props: {} })
            }
          ]
        })
        setIsSyncing(false)
        return
      }

      // Perform bidirectional sync
      const result = (await invoke('dbSyncData', {
        direction: 'bidirectional',
        userId: currentUser.id,
        token: websiteAuth.token
      })) as SyncResult

      // Invalidate queries if any entries were processed
      if (result.entriesProcessed > 0) {
        queryClient.invalidateQueries({ queryKey: ['comicList', currentUser.id] })
        queryClient.invalidateQueries({ queryKey: ['chapters'] })
        queryClient.invalidateQueries({ queryKey: ['readProgress'] })
      }

      // Handle sync results
      if (result.success) {
        // Show success indicator briefly
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1000)
      } else if (result.entriesProcessed > 0) {
        // Partial success - some items synced, some failed
        const synced = result.entriesProcessed - (result.conflicts?.length || 0)
        confirmAlert({
          title: t('HomeNav.sync.partialSuccessTitle'),
          message: t('HomeNav.sync.partialSuccessMessage', {
            synced,
            total: result.entriesProcessed
          }),
          buttons: [{ label: t('HomeNav.sync.okButton') }]
        })
      } else {
        // Complete failure
        confirmAlert({
          title: t('HomeNav.sync.failedTitle'),
          message: t('HomeNav.sync.failedMessage'),
          buttons: [{ label: t('HomeNav.sync.okButton') }]
        })
      }
    } catch (error) {
      console.error('Sync error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Check if it's an authentication error
      if (errorMessage.includes('authentication')) {
        confirmAlert({
          title: t('HomeNav.sync.authRequiredTitle'),
          message: t('HomeNav.sync.authRequiredMessage'),
          buttons: [
            { label: t('General.cancel') },
            {
              label: t('HomeNav.sync.connectButton'),
              action: () => openWindow({ component: 'WebsiteAuth', props: {} })
            }
          ]
        })
      } else {
        // Generic error
        confirmAlert({
          title: t('HomeNav.sync.errorTitle'),
          message: t('HomeNav.sync.errorMessage'),
          buttons: [{ label: t('HomeNav.sync.okButton') }]
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    handleSync,
    isSyncing,
    showSuccess
  }
}

export default useWebsiteSync

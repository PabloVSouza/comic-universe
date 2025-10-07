import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { openWindow } from 'functions'
import { useApi, useUserSettings } from 'hooks'
import { usePersistSessionStore, useWebsiteSyncStore } from 'store'
import { confirmAlert } from 'components/UiComponents'

interface SyncResult {
  success: boolean
  entriesProcessed: number
  conflicts?: unknown[]
}

const useWebsiteSync = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const { userSettings } = useUserSettings()
  const { t } = useTranslation()

  const store = useWebsiteSyncStore()
  const { setIsSyncing, setShowSuccess } = store

  const syncMutation = useMutation({
    mutationFn: async (silent: boolean = false) => {
      setIsSyncing(true)

      if (!currentUser?.id) {
        setIsSyncing(false)
        if (!silent) {
          confirmAlert({
            title: t('HomeNav.sync.noUserTitle'),
            message: t('HomeNav.sync.noUserMessage'),
            buttons: [{ label: t('HomeNav.sync.okButton') }]
          })
        }
        return null
      }

      const websiteAuth = await invoke<{
        token?: string
        isExpired?: boolean
      } | null>('dbGetWebsiteAuthToken', { userId: currentUser.id })

      if (!websiteAuth?.token || websiteAuth.isExpired) {
        setIsSyncing(false)
        if (!silent) {
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
        }
        return null
      }

      const result = await invoke<SyncResult>('dbSyncData', {
        direction: 'bidirectional',
        userId: currentUser.id,
        token: websiteAuth.token
      })

      return { result, silent }
    },
    onSuccess: (data) => {
      if (!data) return

      const { result, silent } = data
      setIsSyncing(false)

      if (result.entriesProcessed > 0) {
        queryClient.invalidateQueries({ queryKey: ['comicList', currentUser!.id] })
        queryClient.invalidateQueries({ queryKey: ['chapters'] })
        queryClient.invalidateQueries({ queryKey: ['readProgress'] })
      }

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1000)
      } else if (!silent) {
        if (result.entriesProcessed > 0) {
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
          confirmAlert({
            title: t('HomeNav.sync.failedTitle'),
            message: t('HomeNav.sync.failedMessage'),
            buttons: [{ label: t('HomeNav.sync.okButton') }]
          })
        }
      }
    },
    onError: (error, silent) => {
      setIsSyncing(false)
      console.error('Sync error:', error)

      if (!silent) {
        confirmAlert({
          title: t('HomeNav.sync.errorTitle'),
          message: t('HomeNav.sync.errorMessage'),
          buttons: [{ label: t('HomeNav.sync.okButton') }]
        })
      }
    }
  })

  const { mutateAsync } = syncMutation

  useEffect(() => {
    const autoSyncEnabled = userSettings?.syncPreferences?.autoSync ?? true

    if (!autoSyncEnabled || !currentUser?.id) {
      useWebsiteSyncStore.setState({
        performSync: async () => {}
      })
      return
    }

    useWebsiteSyncStore.setState({
      performSync: async (silent = false) => {
        await mutateAsync(silent)
      }
    })
  }, [mutateAsync, userSettings?.syncPreferences?.autoSync, currentUser?.id])

  const syncWithToken = async (userId: string, token: string) => {
    setIsSyncing(true)

    try {
      const result = await invoke<SyncResult>('dbSyncData', {
        direction: 'bidirectional',
        userId,
        token
      })

      if (result.entriesProcessed > 0) {
        queryClient.invalidateQueries({ queryKey: ['comicList', userId] })
        queryClient.invalidateQueries({ queryKey: ['chapters'] })
        queryClient.invalidateQueries({ queryKey: ['readProgress'] })
      }

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }

      return result
    } catch (error) {
      console.error('Sync with token error:', error)
      throw error
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    queueSync: useWebsiteSyncStore.getState().queueSync,
    handleSync: useWebsiteSyncStore.getState().handleManualSync,
    syncWithToken,
    isSyncing: store.isSyncing,
    isAutoSyncPending: store.isAutoSyncPending,
    showSuccess: store.showSuccess
  }
}

export default useWebsiteSync

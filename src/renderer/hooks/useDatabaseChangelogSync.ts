import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import { confirmAlert } from 'components/Alert'
import openWindow from 'functions/openWindow'
import usePersistSessionStore from 'store/usePersistSessionStore'
// SyncMetadata is now a global type

const useDatabaseChangelogSync = () => {
  const { invoke } = useApi()
  const { currentUser } = usePersistSessionStore()
  const queryClient = useQueryClient()

  const { mutate: syncData, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      console.log('useDatabaseChangelogSync: Starting sync process')
      console.log('currentUser:', currentUser)

      if (!currentUser.id) {
        console.log('User not authenticated')
        throw new Error('User not authenticated')
      }

      // Check if user is authenticated to website
      const websiteAuth = await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })
      console.log('websiteAuth:', websiteAuth)

      if (!websiteAuth || !websiteAuth.token || websiteAuth.isExpired) {
        console.log('Website authentication not available or expired')
        // Show alert to connect to website
        confirmAlert({
          title: 'Website Authentication Required',
          message:
            'You need to connect your app to your Comic Universe website account to sync your comics and reading progress.',
          buttons: [
            {
              label: 'Cancel'
            },
            {
              label: 'Connect to Website',
              action: () => openWindow({ component: 'WebsiteAuth', props: {} })
            }
          ]
        })
        throw new Error('Website authentication required')
      }

      console.log('Website authentication available, proceeding with sync')

      const syncId = crypto.randomUUID()
      const syncStartTime = Date.now()

      // Log sync start
      console.log('Creating sync start changelog entry')
      await invoke('dbCreateChangelogEntry', {
        entry: {
          userId: currentUser.id,
          entityType: 'sync',
          entityId: 'sync',
          action: 'sync_started',
          data: {
            syncId,
            direction: 'bidirectional',
            lastSyncTimestamp: undefined
          } as SyncMetadata
        }
      })

      const websiteUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://comicuniverse.app'

      try {
        // Get unsynced changelog entries
        console.log('Fetching unsynced changelog entries')
        const unsyncedEntries = await invoke('dbGetUnsyncedChangelogEntries', {
          userId: currentUser.id
        })
        console.log('Unsynced entries found:', unsyncedEntries.length)
        console.log(
          'Unsynced entries details:',
          unsyncedEntries.map((e) => ({
            entityType: e.entityType,
            action: e.action,
            entityId: e.entityId
          }))
        )

        // Filter out sync events from the entries to send
        const dataEntries = unsyncedEntries.filter((entry) => entry.entityType !== 'sync')
        console.log('Data entries to sync:', dataEntries.length)

        let processedEntries = 0
        let conflicts = 0
        const errors: string[] = []

        // Get the last sync timestamp from local changelog
        const lastSyncEntry = unsyncedEntries
          .filter((entry) => entry.entityType === 'sync' && entry.action === 'sync_completed')
          .sort(
            (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          )[0]

        const lastSyncTimestamp = lastSyncEntry?.data?.lastSyncTimestamp || undefined
        console.log('Last sync timestamp:', lastSyncTimestamp)

        console.log('Proceeding with sync - sending request to server')
        // Always send sync request to get latest data from cloud
        const syncRequest = {
          token: websiteAuth.token,
          entries: dataEntries,
          lastSyncTimestamp
        }

        console.log('Sending sync request to:', `${websiteUrl}/api/sync/database-changelog`)
        console.log('Sync request payload:', syncRequest)

        const response = await fetch(`${websiteUrl}/api/sync/database-changelog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(syncRequest)
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Sync error response:', errorData)
          throw new Error(errorData.error || 'Failed to sync with server')
        }

        const result = await response.json()
        console.log('Sync result:', result)
        processedEntries = result.processedEntries || 0
        conflicts = result.conflicts?.length || 0

        if (result.conflicts && result.conflicts.length > 0) {
          errors.push(...result.conflicts.map((c: any) => c.error || 'Unknown conflict'))
          console.warn('⚠️ Sync had conflicts:', result.conflicts)
        }

        // Mark sent entries as synced (only the ones successfully processed by server)
        if (result.syncedEntryIds && result.syncedEntryIds.length > 0) {
          await invoke('dbMarkChangelogEntriesAsSynced', { entryIds: result.syncedEntryIds })
          console.log('Marked as synced:', result.syncedEntryIds.length, 'entries')
        }

        // Handle server entries if provided
        if (result.serverEntries && result.serverEntries.length > 0) {
          console.log('Processing server entries:', result.serverEntries.length)
          await applyServerEntries(result.serverEntries)
        } else {
          console.log('No server entries to process')
        }

        const syncDuration = Date.now() - syncStartTime

        // Log sync completion
        await invoke('dbCreateChangelogEntry', {
          entry: {
            userId: currentUser.id,
            entityType: 'sync',
            entityId: 'sync',
            action: 'sync_completed',
            data: {
              syncId,
              direction: 'bidirectional',
              entriesProcessed: processedEntries,
              conflicts,
              errors: errors.length > 0 ? errors : undefined,
              duration: syncDuration,
              lastSyncTimestamp: new Date().toISOString()
            } as SyncMetadata
          }
        })

        console.log('✅ Sync completed successfully!', {
          processedEntries,
          conflicts,
          duration: syncDuration + 'ms'
        })

        return {
          processedEntries,
          conflicts,
          errors,
          duration: syncDuration
        }
      } catch (error) {
        const syncDuration = Date.now() - syncStartTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Log sync failure
        await invoke('dbCreateChangelogEntry', {
          entry: {
            userId: currentUser.id,
            entityType: 'sync',
            entityId: 'sync',
            action: 'sync_failed',
            data: {
              syncId,
              direction: 'bidirectional',
              errors: [errorMessage],
              duration: syncDuration,
              lastSyncTimestamp: undefined
            } as SyncMetadata
          }
        })

        throw error
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['comicList', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userReadProgress', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
    },
    onError: (error) => {
      console.error('Database changelog sync failed:', error)
    }
  })

  // Apply server entries to local database
  const applyServerEntries = async (serverEntries: any[]) => {
    for (const entry of serverEntries) {
      try {
        switch (entry.entityType) {
          case 'comic':
            if (entry.action === 'created' || entry.action === 'updated') {
              await invoke('dbInsertComic', {
                comic: entry.data,
                chapters: [],
                repo: entry.data?.repo || '',
                userId: currentUser.id
              })
            } else if (entry.action === 'deleted') {
              await invoke('dbDeleteComic', { comic: { id: entry.entityId } })
            }
            break

          case 'chapter':
            if (entry.action === 'created' || entry.action === 'updated') {
              await invoke('dbInsertChapters', {
                chapters: [entry.data]
              })
            } else if (entry.action === 'deleted') {
              await invoke('dbDeleteChapter', { chapterId: entry.entityId })
            }
            break

          case 'readProgress':
            if (entry.action === 'created' || entry.action === 'updated') {
              await invoke('dbInsertReadProgress', {
                readProgress: {
                  ...entry.data,
                  userId: currentUser.id
                }
              })
            } else if (entry.action === 'deleted') {
              await invoke('dbDeleteReadProgress', { id: entry.entityId })
            }
            break
        }

        // Note: Don't create changelog entries for server data - the database insert methods
        // will create them automatically, and we'll mark them as synced in the next step
      } catch (error) {
        console.error(`Failed to apply server entry:`, error)
      }
    }

    // Mark all recently created changelog entries from server data as synced
    // This prevents them from being sent back to the server
    const recentUnsyncedEntries = await invoke('dbGetUnsyncedChangelogEntries', {
      userId: currentUser.id
    })
    const recentEntryIds = recentUnsyncedEntries
      .filter((entry) => {
        // Filter entries that match the server entries we just applied
        return serverEntries.some(
          (serverEntry) =>
            serverEntry.entityType === entry.entityType &&
            serverEntry.entityId === entry.entityId &&
            serverEntry.action === entry.action
        )
      })
      .map((entry) => entry.id!)
      .filter(Boolean)

    if (recentEntryIds.length > 0) {
      await invoke('dbMarkChangelogEntriesAsSynced', { entryIds: recentEntryIds })
    }
  }

  return {
    syncData,
    isSyncing
  }
}

export default useDatabaseChangelogSync

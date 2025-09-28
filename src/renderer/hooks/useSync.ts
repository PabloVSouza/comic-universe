import { useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import { confirmAlert } from 'components/Alert'
import { useTranslation } from 'react-i18next'
import openWindow from 'functions/openWindow'

interface SyncData {
  comics: IComic[]
  readProgress: IReadProgress[]
  lastSyncAt?: string
  websiteUserId: string
}

const useSync = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()
  const { t } = useTranslation()

  const { mutate: syncData, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      if (!currentUser.id) {
        throw new Error('No user selected')
      }

      // Get website authentication token
      const websiteAuth = await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })

      if (!websiteAuth?.token || websiteAuth.isExpired) {
        // Show alert instead of throwing error
        confirmAlert({
          title: t('Settings.user.websiteAuth.syncRequired'),
          message: t('Settings.user.websiteAuth.syncRequiredMessage'),
          buttons: [
            {
              label: t('Settings.user.websiteAuth.connectToSync'),
              action: () => {
                // Open the website auth window
                openWindow({
                  component: 'WebsiteAuth',
                  props: {}
                })
              }
            }
          ]
        })
        return // Exit early without syncing
      }

      const websiteUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://comicuniverse.app'

      // Step 1: Download data from cloud
      const cloudResponse = await fetch(`${websiteUrl}/api/sync/get-user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: websiteAuth.token
        })
      })

      if (!cloudResponse.ok) {
        const errorData = await cloudResponse.json()
        throw new Error(errorData.error || 'Failed to fetch cloud data')
      }

      const cloudData: SyncData = await cloudResponse.json()

      // Step 2: Get local data
      const localComics = await invoke('dbGetAllComics', { userId: currentUser.id })
      const localReadProgress = await invoke('dbGetReadProgressByUser', { userId: currentUser.id })

      // Step 3: Compare and merge data
      const syncResult = await compareAndMergeData(localComics, localReadProgress, cloudData)

      // Step 4: Update local database with merged data
      await updateLocalDatabase(syncResult.localUpdates)

      // Step 5: Send differences to cloud
      if (
        syncResult.cloudUpdates.comics.length > 0 ||
        syncResult.cloudUpdates.readProgress.length > 0 ||
        (syncResult.cloudUpdates.readProgressDeletions &&
          syncResult.cloudUpdates.readProgressDeletions.length > 0)
      ) {
        // Send updates first
        if (
          syncResult.cloudUpdates.comics.length > 0 ||
          syncResult.cloudUpdates.readProgress.length > 0
        ) {
          const updateResponse = await fetch(`${websiteUrl}/api/sync/update-user-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: websiteAuth.token,
              comics: syncResult.cloudUpdates.comics,
              readProgress: syncResult.cloudUpdates.readProgress
            })
          })

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json()
            throw new Error(errorData.error || 'Failed to update cloud data')
          }

          await updateResponse.json()
        }

        // Send deletions
        if (
          syncResult.cloudUpdates.readProgressDeletions &&
          syncResult.cloudUpdates.readProgressDeletions.length > 0
        ) {
          for (const deletion of syncResult.cloudUpdates.readProgressDeletions) {
            const deleteResponse = await fetch(`${websiteUrl}/api/progress`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${websiteAuth.token}`
              },
              body: JSON.stringify({
                comicId: deletion.comicId,
                chapterId: deletion.chapterId
              })
            })

            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json()
              console.error('Failed to delete read progress:', errorData)
            }
          }
        }
      }

      return {
        localUpdates: syncResult.localUpdates,
        cloudUpdates: syncResult.cloudUpdates,
        conflicts: syncResult.conflicts
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['comicList', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userReadProgress', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['readProgressData'] })
    },
    onError: (error) => {
      console.error('Sync failed:', error)
    }
  })

  const compareAndMergeData = async (
    localComics: IComic[],
    localReadProgress: IReadProgress[],
    cloudData: SyncData
  ) => {
    const localUpdates = {
      comics: [] as IComic[],
      chapters: [] as IChapter[],
      readProgress: [] as IReadProgress[]
    }
    const cloudUpdates = {
      comics: [] as IComic[],
      readProgress: [] as IReadProgress[],
      readProgressDeletions: [] as { chapterId: string; comicId: string }[]
    }

    // Compare comics
    for (const cloudComic of cloudData.comics) {
      const localComic = localComics.find((c) => c.siteId === cloudComic.siteId)

      if (!localComic) {
        // Comic doesn't exist locally, add it
        localUpdates.comics.push({
          ...cloudComic
        })

        // Add chapters for this comic
        for (const cloudChapter of cloudComic.chapters || []) {
          localUpdates.chapters.push({
            ...cloudChapter,
            comicId: cloudComic.id // This will be updated after comic is created
          })
        }
      } else {
        // Comic exists, check if it needs updating
        const needsUpdate =
          localComic.name !== cloudComic.name ||
          localComic.synopsis !== cloudComic.synopsis ||
          localComic.cover !== cloudComic.cover

        if (needsUpdate) {
          localUpdates.comics.push({
            ...localComic,
            name: cloudComic.name,
            synopsis: cloudComic.synopsis,
            cover: cloudComic.cover || localComic.cover
          })
        }

        // Compare chapters
        await compareChapters(localComic, cloudComic, localUpdates)
      }
    }

    // Check for local comics that don't exist in cloud
    for (const localComic of localComics) {
      const cloudComic = cloudData.comics.find((c) => c.siteId === localComic.siteId)

      if (!cloudComic) {
        // Local comic doesn't exist in cloud, send it
        const localChapters = await invoke('dbGetChapters', { comicId: localComic.id })

        cloudUpdates.comics.push({
          ...localComic,
          chapters: localChapters
        })
      } else {
        // Comic exists in cloud, check if we need to send chapters
        const localChapters = await invoke('dbGetChapters', { comicId: localComic.id })
        const cloudChapters = cloudComic.chapters || []

        // Check if there are local chapters that don't exist in cloud
        const localChapterIds = localChapters.map((c) => c.id)
        const cloudChapterIds = cloudChapters.map((c) => c.id)
        const missingChapterIds = localChapterIds.filter((id) => !cloudChapterIds.includes(id))

        if (missingChapterIds.length > 0) {
          cloudUpdates.comics.push({
            ...localComic,
            chapters: localChapters
          })
        }
      }
    }

    // Compare read progress with conflict resolution
    const readProgressConflicts = await compareReadProgress(
      localReadProgress,
      cloudData.readProgress,
      localUpdates,
      cloudUpdates
    )

    return {
      localUpdates,
      cloudUpdates,
      conflicts: readProgressConflicts
    }
  }

  const compareChapters = async (
    localComic: IComic,
    cloudComic: IComic,
    localUpdates: {
      comics: IComic[]
      chapters: IChapter[]
      readProgress: IReadProgress[]
    }
  ) => {
    const localChapters = await invoke('dbGetChapters', { comicId: localComic.id })

    for (const cloudChapter of cloudComic.chapters || []) {
      const localChapter = localChapters.find((c) => c.siteId === cloudChapter.siteId)

      if (!localChapter) {
        // Chapter doesn't exist locally, add it
        localUpdates.chapters.push({
          ...cloudChapter,
          comicId: localComic.id
        })
      } else {
        // Chapter exists, check if it needs updating
        const needsUpdate =
          localChapter.number !== cloudChapter.number ||
          localChapter.name !== cloudChapter.name ||
          localChapter.pages !== cloudChapter.pages

        if (needsUpdate) {
          localUpdates.chapters.push({
            ...localChapter,
            number: cloudChapter.number,
            name: cloudChapter.name,
            pages: cloudChapter.pages || localChapter.pages
          })
        }
      }
    }

    // Check for local chapters that don't exist in cloud
    for (const localChapter of localChapters) {
      const cloudChapter = cloudComic.chapters?.find((c) => c.siteId === localChapter.siteId)

      if (!cloudChapter) {
        // Local chapter doesn't exist in cloud, it will be sent with the comic
        // This is handled in the main comic comparison
      }
    }
  }

  const compareReadProgress = async (
    localReadProgress: IReadProgress[],
    cloudReadProgress: IReadProgress[],
    localUpdates: { comics: IComic[]; chapters: IChapter[]; readProgress: IReadProgress[] },
    cloudUpdates: {
      comics: IComic[]
      readProgress: IReadProgress[]
      readProgressDeletions: { chapterId: string; comicId: string }[]
    }
  ) => {
    const readProgressConflicts = []

    for (const cloudProgress of cloudReadProgress) {
      const localProgress = localReadProgress.find((p) => p.chapterId === cloudProgress.chapterId)

      if (!localProgress) {
        // Read progress doesn't exist locally, add it
        localUpdates.readProgress.push({
          ...cloudProgress,
          userId: currentUser.id || ''
        })
      } else {
        // Read progress exists in both places, check for conflicts
        const sameProgress =
          localProgress.page === cloudProgress.page &&
          localProgress.totalPages === cloudProgress.totalPages

        if (sameProgress) {
          // Same progress, no conflict
          continue
        } else {
          // Different progress - use updatedAt to determine priority
          const cloudUpdatedAt = new Date(cloudProgress.updatedAt || 0)
          const localUpdatedAt = new Date(localProgress.updatedAt || 0)

          if (cloudUpdatedAt > localUpdatedAt) {
            // Cloud is newer, update local
            localUpdates.readProgress.push({
              ...localProgress,
              page: cloudProgress.page,
              totalPages: cloudProgress.totalPages,
              updatedAt: cloudProgress.updatedAt
            })
          } else {
            // Local is newer (or same time), send to cloud
            cloudUpdates.readProgress.push({
              ...localProgress,
              updatedAt: localProgress.updatedAt || new Date().toISOString()
            })
          }
        }
      }
    }

    // Check for local read progress that doesn't exist in cloud
    for (const localProgress of localReadProgress) {
      const cloudProgress = cloudReadProgress.find((p) => p.chapterId === localProgress.chapterId)

      if (!cloudProgress) {
        // Local read progress doesn't exist in cloud, send it
        cloudUpdates.readProgress.push({
          ...localProgress,
          updatedAt: localProgress.updatedAt || new Date().toISOString()
        })
      }
    }

    // Check for cloud read progress that doesn't exist locally (deleted locally)
    // Only check for deletions if the local database has some data (not a fresh database)
    // Only detect deletions if local database has some data
    if (localReadProgress.length > 0) {
      for (const cloudProgress of cloudReadProgress) {
        const localProgress = localReadProgress.find(
          (p) =>
            p.chapterId === cloudProgress.chapterId ||
            p.Chapter?.siteId === cloudProgress.Chapter?.siteId
        )

        if (!localProgress) {
          // Read progress exists in cloud but not locally - it was deleted locally
          cloudUpdates.readProgressDeletions = cloudUpdates.readProgressDeletions || []
          cloudUpdates.readProgressDeletions.push({
            chapterId: cloudProgress.chapterId,
            comicId: cloudProgress.comicId
          })
        }
      }
    }

    return readProgressConflicts
  }

  const updateLocalDatabase = async (localUpdates: {
    comics: IComic[]
    chapters: IChapter[]
    readProgress: IReadProgress[]
  }) => {
    // Update comics
    for (const comic of localUpdates.comics) {
      // Get all local comics to check if this one exists
      const localComics = await invoke('dbGetAllComics', { userId: currentUser.id })
      const existingComic = localComics.find((c) => c.siteId === comic.siteId)

      if (existingComic) {
        // Update existing comic
        await invoke('dbUpdateComic', { id: existingComic.id, comic })
      } else {
        // Create new comic
        await invoke('dbInsertComic', {
          comic,
          chapters: localUpdates.chapters.filter((c) => c.comicId === comic.id),
          repo: comic.repo,
          userId: currentUser.id
        })
      }
    }

    // Update read progress
    for (const progress of localUpdates.readProgress) {
      // When downloading from cloud, always create new read progress
      // The cloud ID is preserved in the database schema
      await invoke('dbInsertReadProgress', { readProgress: progress })
    }
  }

  return {
    syncData,
    isSyncing
  }
}

export default useSync

import { create } from 'zustand'

type SyncOperation = 'comic' | 'chapter' | 'readProgress' | 'settings'

const SYNC_DEBOUNCE_MS = 2000

interface WebsiteSyncStore {
  isAutoSyncPending: boolean
  showSuccess: boolean
  isSyncing: boolean
  syncTimeout: NodeJS.Timeout | null
  pendingOperations: Set<SyncOperation>

  queueSync: (operation: SyncOperation) => void
  performSync: (silent?: boolean) => Promise<void>
  handleManualSync: () => void
  setIsAutoSyncPending: (pending: boolean) => void
  setShowSuccess: (success: boolean) => void
  setIsSyncing: (syncing: boolean) => void
  setSyncTimeout: (timeout: NodeJS.Timeout | null) => void
  setSyncFunction: (fn: (silent?: boolean) => Promise<void>) => void
  clearPendingOperations: () => void
}

const useWebsiteSyncStore = create<WebsiteSyncStore>((set, get) => ({
  isAutoSyncPending: false,
  showSuccess: false,
  isSyncing: false,
  syncTimeout: null,
  pendingOperations: new Set(),

  setIsAutoSyncPending: (pending) => set({ isAutoSyncPending: pending }),
  setShowSuccess: (success) => set({ showSuccess: success }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setSyncTimeout: (timeout) => set({ syncTimeout: timeout }),
  setSyncFunction: (fn) => set({ performSync: fn }),
  clearPendingOperations: () => set({ pendingOperations: new Set() }),

  queueSync: (operation) => {
    const state = get()

    const newSet = new Set(state.pendingOperations)
    newSet.add(operation)
    set({ pendingOperations: newSet })
    set({ isAutoSyncPending: true })

    if (state.syncTimeout) {
      clearTimeout(state.syncTimeout)
    }

    const newTimeout = setTimeout(async () => {
      get().clearPendingOperations()
      await get().performSync(true)
      set({ isAutoSyncPending: false })
    }, SYNC_DEBOUNCE_MS)

    set({ syncTimeout: newTimeout })
  },

  performSync: async () => {},

  handleManualSync: () => {
    const state = get()

    if (state.syncTimeout) {
      clearTimeout(state.syncTimeout)
      set({ syncTimeout: null })
    }
    get().clearPendingOperations()
    set({ isAutoSyncPending: false })
    get().performSync(false)
  }
}))

export default useWebsiteSyncStore

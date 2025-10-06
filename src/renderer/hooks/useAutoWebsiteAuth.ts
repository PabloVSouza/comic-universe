import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { getApiBaseUrl } from 'shared/constants'
import usePersistSessionStore from 'store/usePersistSessionStore'

const useAutoWebsiteAuth = () => {
  const { currentUser } = usePersistSessionStore()
  const { invoke } = useApi()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!currentUser) return

      try {
        const authData = await invoke<{
          token?: string
          isExpired?: boolean
        } | null>('dbGetWebsiteAuthToken', { userId: currentUser.id })

        if (authData && authData.token && !authData.isExpired) {
          // User is authenticated and token is valid
          return
        }

        // No valid token - user needs to authenticate manually via Settings > User > Website Auth
      } catch {
        // Silently handle errors - user will authenticate manually if needed
      }
    }

    // Small delay to ensure user is fully loaded
    const timer = setTimeout(checkAuthStatus, 1000)
    return () => clearTimeout(timer)
  }, [currentUser, invoke, queryClient])

  const websiteUrl = getApiBaseUrl(process.env.NODE_ENV === 'development')

  return { websiteUrl }
}

export default useAutoWebsiteAuth

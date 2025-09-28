import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useApi from 'api'
import usePersistSessionStore from 'store/usePersistSessionStore'
import openWindow from 'functions/openWindow'
import { confirmAlert } from 'components/Alert'

const useAutoWebsiteAuth = () => {
  const { invoke } = useApi()
  const queryClient = useQueryClient()
  const { currentUser } = usePersistSessionStore()

  // Get stored website auth token
  const { data: websiteAuth, isLoading } = useQuery({
    queryKey: ['websiteAuth', currentUser.id],
    queryFn: async () => {
      if (!currentUser.id) return null
      return await invoke('dbGetWebsiteAuthToken', { userId: currentUser.id })
    },
    enabled: !!currentUser.id,
    initialData: null
  })

  // Auto-authenticate with website on app startup
  useEffect(() => {
    const autoAuthenticate = async () => {
      if (!currentUser.id || !websiteAuth?.token || websiteAuth?.isExpired) {
        return
      }

      try {
        const websiteUrl =
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : 'https://comicuniverse.app'

        // Verify token with website
        const response = await fetch(`${websiteUrl}/api/auth/verify-app-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: websiteAuth.token
          })
        })

        if (response.ok) {
          console.log('Website authentication successful')
          // Token is valid, no need to prompt user
        } else {
          console.log('Website authentication failed, prompting for re-authentication')
          // Token is invalid/expired, prompt user to re-authenticate
          showReAuthPrompt()
        }
      } catch (error) {
        console.error('Failed to verify website token:', error)
        // Network error or other issue, prompt user to re-authenticate
        showReAuthPrompt()
      }
    }

    // Only run auto-authentication if we have a user and token
    if (currentUser.id && websiteAuth?.token && !websiteAuth?.isExpired) {
      autoAuthenticate()
    }
  }, [currentUser.id, websiteAuth])

  // Clear website auth token mutation
  const { mutate: clearWebsiteAuth } = useMutation({
    mutationFn: async () => {
      if (!currentUser.id) return
      await invoke('dbClearWebsiteAuthToken', { userId: currentUser.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteAuth', currentUser.id] })
      queryClient.invalidateQueries({ queryKey: ['userSettings', currentUser.id] })
    }
  })

  // Show re-authentication prompt using Alert system
  const showReAuthPrompt = () => {
    confirmAlert({
      title: 'Website Authentication Required',
      message:
        'Your website authentication has expired or is invalid. Please re-authenticate to continue using website features.',
      buttons: [
        {
          label: 'Skip',
          action: () => {
            clearWebsiteAuth()
          }
        },
        {
          label: 'Re-authenticate',
          action: () => {
            openWindow({
              component: 'WebsiteAuth',
              props: {}
            })
          }
        }
      ]
    })
  }

  return {
    isLoading
  }
}

export default useAutoWebsiteAuth

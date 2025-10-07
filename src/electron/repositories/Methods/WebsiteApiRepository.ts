import axios from 'axios'

/**
 * WebsiteApiRepository
 * Handles API communication with the Comic Universe website from the Electron main process
 * This bypasses CORS restrictions since main process is not subject to browser security
 */
class WebsiteApiRepository {
  private readonly baseUrl = 'https://comicuniverse.app'

  public methods = {
    /**
     * Authenticate with the website and get an app token
     */
    websiteLogin: async (params: {
      email: string
      password: string
      userId: string
      deviceName: string
      expiresInDays?: number
    }) => {
      try {
        const response = await axios.post(`${this.baseUrl}/api/auth/app-login`, params, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return response.data
      } catch (error) {
        console.error('Website login error:', error)
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.error || 'Login failed')
        }
        throw error
      }
    },

    /**
     * Verify an existing app token
     */
    websiteVerifyToken: async (params: { token: string }) => {
      try {
        const response = await axios.post(`${this.baseUrl}/api/auth/verify-app-token`, params, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return response.data
      } catch (error) {
        console.error('Website token verification error:', error)
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.error || 'Token verification failed')
        }
        throw error
      }
    },

    /**
     * Sync changelog with the website
     */
    websiteSync: async (params: {
      token: string
      entries: Array<unknown>
      lastSyncTimestamp?: string
    }) => {
      try {
        const response = await axios.post(`${this.baseUrl}/api/sync/changelog`, params, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return response.data
      } catch (error) {
        console.error('Website sync error:', error)
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.error || 'Sync failed')
        }
        throw error
      }
    }
  }
}

export default WebsiteApiRepository

/**
 * API Configuration Constants
 * Centralized URLs for local development and production
 */

export const API_URLS = {
  DEV: 'http://localhost:3000',
  PROD: 'https://comicuniverse.app'
} as const

/**
 * Get the appropriate API base URL based on environment
 * @param isDev - Whether running in development mode
 * @returns The API base URL
 */
export function getApiBaseUrl(isDev: boolean): string {
  return isDev ? API_URLS.DEV : API_URLS.PROD
}

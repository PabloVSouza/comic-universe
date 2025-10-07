export const API_URLS = {
  DEV: 'http://localhost:3000',
  PROD: 'https://comicuniverse.app'
} as const

export function getApiBaseUrl(isDev: boolean): string {
  return isDev ? API_URLS.DEV : API_URLS.PROD
}

/**
 * Utility functions to detect the current environment (Electron vs Web UI)
 * These can be used in both React components (via hooks) and utility functions
 */

/**
 * Check if we're running in Electron
 */
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.Electron
}

/**
 * Check if we're running in Web UI mode
 */
export const isWebUI = (): boolean => {
  return typeof window !== 'undefined' && !window.Electron
}

/**
 * Check if we're in development mode
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV
}

/**
 * Check if we're in production mode
 */
export const isProd = (): boolean => {
  return import.meta.env.PROD
}

/**
 * Check if Web UI settings should be disabled
 */
export const shouldDisableWebUISettings = (): boolean => {
  return isWebUI()
}

/**
 * Check if Web UI settings can be modified
 */
export const canModifyWebUISettings = (): boolean => {
  return isElectron()
}

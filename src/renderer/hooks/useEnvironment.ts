import { useMemo } from 'react'
import {
  isElectron as isElectronUtil,
  isWebUI as isWebUIUtil,
  isDev as isDevUtil,
  isProd as isProdUtil,
  shouldDisableWebUISettings as shouldDisableWebUISettingsUtil,
  canModifyWebUISettings as canModifyWebUISettingsUtil
} from 'renderer-utils/environment'

/**
 * Hook to detect the current environment (Electron vs Web UI)
 * @returns Object with environment detection flags and utilities
 */
export const useEnvironment = () => {
  const environment = useMemo(() => {
    return {
      isElectron: isElectronUtil(),
      isWebUI: isWebUIUtil(),
      isDev: isDevUtil(),
      isProd: isProdUtil(),
      shouldDisableWebUISettings: shouldDisableWebUISettingsUtil(),
      canModifyWebUISettings: canModifyWebUISettingsUtil()
    }
  }, [])

  return environment
}

export default useEnvironment

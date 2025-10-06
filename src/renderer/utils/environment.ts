export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.Electron
}

export const isWebUI = (): boolean => {
  return typeof window !== 'undefined' && !window.Electron
}

export const isDev = (): boolean => {
  return import.meta.env.DEV
}

export const isProd = (): boolean => {
  return import.meta.env.PROD
}

export const shouldDisableWebUISettings = (): boolean => {
  return isWebUI()
}

export const canModifyWebUISettings = (): boolean => {
  return isElectron()
}

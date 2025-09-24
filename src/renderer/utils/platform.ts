export const isWindows = (): boolean => {
  return navigator.platform.toLowerCase().includes('win')
}

export const isMac = (): boolean => {
  return navigator.platform.toLowerCase().includes('mac')
}

export const isLinux = (): boolean => {
  return navigator.platform.toLowerCase().includes('linux')
}

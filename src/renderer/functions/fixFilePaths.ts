import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  if (path.startsWith('http')) return path

  // Check if we're running in Web UI mode
  const isWebUIMode = window.location.origin.includes('localhost:8888')

  if (isWebUIMode) {
    // In Web UI mode, serve files through the Express server
    // Remove the file:// prefix and extract the relative path from plugins directory
    const cleanPath = path.replace(/^file:\/\//, '')

    // Extract the relative path from the plugins directory
    // e.g., /Volumes/projects/.../dev-data/plugins/comic-universe-plugin-hqnow/icon.svg
    // becomes: comic-universe-plugin-hqnow/icon.svg
    const pluginsIndex = cleanPath.indexOf('/plugins/')
    if (pluginsIndex !== -1) {
      const relativePath = cleanPath.substring(pluginsIndex + '/plugins/'.length)
      return `/api/plugins/${relativePath}`
    }

    // Fallback: try to serve the file directly
    return `/api/plugins/${cleanPath}`
  }

  const { appParams } = useGlobalStore.getState()

  // If path is already absolute, use it directly
  if (path.startsWith('/')) {
    return 'file://' + path
  }

  const prefix = appParams.isDev ? appParams.appRunningPath : ''

  return 'file://' + prefix + '/' + path
}

export default FixFilePaths

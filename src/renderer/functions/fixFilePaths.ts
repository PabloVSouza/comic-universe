import { isWebUI } from 'renderer-utils/environment'
import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  if (path.startsWith('http')) return path

  // Check if we're running in Web UI mode
  if (isWebUI()) {
    // In Web UI mode, serve files through the Express server
    // Remove the file:// prefix and extract the relative path from plugins directory
    const cleanPath = path.replace(/^file:\/\//, '')

    // Extract the relative path from the plugins directory
    // Handle both Windows (\plugins\) and Unix (/plugins/) path separators
    // e.g., C:\Users\...\dev-data\plugins\comic-universe-plugin-hqnow\icon.svg
    // or /Volumes/projects/.../dev-data/plugins/comic-universe-plugin-hqnow/icon.svg
    // becomes: comic-universe-plugin-hqnow/icon.svg
    const pluginsIndexUnix = cleanPath.indexOf('/plugins/')
    const pluginsIndexWindows = cleanPath.indexOf('\\plugins\\')

    if (pluginsIndexUnix !== -1) {
      const relativePath = cleanPath.substring(pluginsIndexUnix + '/plugins/'.length)
      return `/api/plugins/${relativePath}`
    } else if (pluginsIndexWindows !== -1) {
      const relativePath = cleanPath.substring(pluginsIndexWindows + '\\plugins\\'.length)
      // Convert Windows path separators to forward slashes for URL
      return `/api/plugins/${relativePath.replace(/\\/g, '/')}`
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

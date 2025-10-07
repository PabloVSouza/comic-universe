import { isWebUI } from 'renderer-utils/environment'
import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  if (path.startsWith('http')) return path

  if (isWebUI()) {
    const cleanPath = path.replace(/^file:\/\//, '')

    const pluginsIndexUnix = cleanPath.indexOf('/plugins/')
    const pluginsIndexWindows = cleanPath.indexOf('\\plugins\\')

    if (pluginsIndexUnix !== -1) {
      const relativePath = cleanPath.substring(pluginsIndexUnix + '/plugins/'.length)
      return `/api/plugins/${relativePath}`
    } else if (pluginsIndexWindows !== -1) {
      const relativePath = cleanPath.substring(pluginsIndexWindows + '\\plugins\\'.length)
      return `/api/plugins/${relativePath.replace(/\\/g, '/')}`
    }

    return `/api/plugins/${cleanPath}`
  }

  const { appParams } = useGlobalStore.getState()

  if (path.startsWith('/')) {
    return 'file://' + path
  }

  const prefix = appParams.isDev ? appParams.appRunningPath : ''

  return 'file://' + prefix + '/' + path
}

export default FixFilePaths

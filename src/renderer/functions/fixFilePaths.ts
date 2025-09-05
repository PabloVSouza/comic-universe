import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  if (path.startsWith('http')) return path

  const { appParams } = useGlobalStore.getState()

  // If path is already absolute, use it directly
  if (path.startsWith('/')) {
    return 'file://' + path
  }

  const prefix = appParams.isDev ? appParams.appRunningPath : ''

  return 'file://' + prefix + '/' + path
}

export default FixFilePaths

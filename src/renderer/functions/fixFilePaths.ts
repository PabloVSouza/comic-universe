import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  const { appRunningPath, appPath } = useGlobalStore.getState()

  const { isDev } = window

  const prefix = isDev ? appRunningPath : appPath
  return 'file://' + window.path.join(prefix, path)
}

export default FixFilePaths

import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  const { appRunningPath } = useGlobalStore.getState()

  const { isDev } = window

  const prefix = isDev ? appRunningPath : ''
  return 'file://' + window.path.join(prefix, path)
}

export default FixFilePaths

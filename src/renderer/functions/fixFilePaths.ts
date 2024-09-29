import useGlobalStore from 'store/useGlobalStore'

const FixFilePaths = (path: string) => {
  if (path.startsWith('http')) return path

  const { appParams } = useGlobalStore.getState()

  const prefix = appParams.isDev ? appParams.appRunningPath : ''

  return 'file://' + prefix + '/' + path
}

export default FixFilePaths

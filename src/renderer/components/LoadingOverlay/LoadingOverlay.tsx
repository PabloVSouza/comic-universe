import Cover from 'components/Cover/Cover'
import Image from 'components/Image/Image'

import style from './style.module.scss'

import imgLoading from 'assets/loading.svg'

interface Loading {
  isLoading: boolean
  message?: string
  progress?: {
    current: number
    total: number
  }
}

const LoadingOverlay = ({ isLoading, message, progress }: Loading): JSX.Element => {
  const totalProgress = progress ? Math.round((100 / progress.total) * progress.current) : 0
  return (
    <Cover visible={isLoading} index="999">
      {message ? (
        <div className={style.message}>
          <h1>{message}</h1>
          <Image pure src={imgLoading} alt="" />
          <div className={style.progressBar}>
            <p>{totalProgress}%</p>
            <div className={style.bar} style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
      ) : (
        <Image pure src={imgLoading} alt="" />
      )}
    </Cover>
  )
}

export default LoadingOverlay

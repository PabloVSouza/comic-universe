import Cover from 'components/Cover'
import Image from 'components/Image'
import ProgressBar from 'components/ProgressBar'

import imgLoading from 'assets/loading.svg'

interface ILoadingProps {
  isLoading: boolean
  message?: string
  progress?: {
    current: number
    total: number
  }
}

const LoadingOverlay = ({ isLoading, message, progress }: ILoadingProps): JSX.Element => {
  return (
    <Cover visible={isLoading}>
      {message ? (
        <div
          className={
            'w-96 h-60 rounded bg-dark text-text-light flex flex-col justify-center items-center px-5'
          }
        >
          <h1>{message}</h1>
          <Image src={imgLoading} svg alt="" className="h-full" />
          <ProgressBar
            current={progress?.current ?? 0}
            total={progress?.total ?? 0}
            showPercentage
          />
        </div>
      ) : (
        <Image src={imgLoading} svg alt="" />
      )}
    </Cover>
  )
}

export default LoadingOverlay

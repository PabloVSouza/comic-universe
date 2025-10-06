import { FC } from 'react'
import { loadingIcon } from 'assets'
import Cover from './Cover'
import Image from './Image'
import ProgressBar from './ProgressBar'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: {
    current: number
    total: number
  }
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isLoading, message, progress }) => {
  return (
    <Cover visible={isLoading}>
      {message ? (
        <div
          className={
            'w-96 h-60 rounded bg-dark text-text-light flex flex-col justify-center items-center px-5'
          }
        >
          <h1>{message}</h1>
          <Image src={loadingIcon} alt="" className="h-full" />
          <ProgressBar
            current={progress?.current ?? 0}
            total={progress?.total ?? 0}
            showPercentage
          />
        </div>
      ) : (
        <Image src={loadingIcon} alt="" />
      )}
    </Cover>
  )
}

export default LoadingOverlay

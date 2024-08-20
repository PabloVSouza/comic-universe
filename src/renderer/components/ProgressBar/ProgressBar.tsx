import style from './ProgressBar.module.scss'
import classNames from 'classnames'

const ProgressBar = ({
  current,
  total,
  showPercentage,
  className,
  ...props
}: {
  current: number
  total: number
  showPercentage?: boolean
  className?: string
}): JSX.Element => {
  const percentage = Math.round((100 / total) * current)

  return (
    <div
      className={classNames(
        'flex flex-col h-full w-full text-center relative transition-all duration-500 ease-default',
        className
      )}
      {...props}
    >
      {showPercentage && (
        <p className="absolute mx-auto left-0 right-0 top-1/2 -translate-y-1/2 font-light transition-all ease-default">
          {percentage}%
        </p>
      )}
      <div
        className={'bg-lime-500/60 flex-grow transition-all duration-500 ease-default'}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar

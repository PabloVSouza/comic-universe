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
    <div className={classNames(style.ProgressBar, className)} {...props}>
      {showPercentage && <p>{percentage}%</p>}
      <div className={style.bar} style={{ width: `${percentage}%` }} />
    </div>
  )
}

export default ProgressBar

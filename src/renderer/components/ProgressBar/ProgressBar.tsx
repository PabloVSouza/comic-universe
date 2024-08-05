import style from './ProgressBar.module.scss'

const ProgressBar = ({
  current,
  total,
  showPercentage
}: {
  current: number
  total: number
  showPercentage?: boolean
}): JSX.Element => {
  const percentage = Math.round((100 / total) * current)

  return (
    <div className={style.ProgressBar}>
      {showPercentage && <p>{percentage}%</p>}
      <div className={style.bar} style={{ width: `${percentage}%` }} />
    </div>
  )
}

export default ProgressBar

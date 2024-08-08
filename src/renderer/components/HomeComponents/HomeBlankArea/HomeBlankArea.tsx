import classNames from 'classnames'
import style from './HomeBlankArea.module.scss'

const HomeBlankArea = ({ active }: { active?: boolean }) => {
  return <div className={classNames(style.HomeBlankArea, active ? style.Active : null)} />
}

export default HomeBlankArea

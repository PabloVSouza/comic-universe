import DashboardListItem from './Item'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const DashboardList = (): JSX.Element => {
  const { comic } = useDashboardStore()

  return (
    <ul className={style.DashboardList}>
      {comic.chapters.map((item) => (
        <DashboardListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default DashboardList

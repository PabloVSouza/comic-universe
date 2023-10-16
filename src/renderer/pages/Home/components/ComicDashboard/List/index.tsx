import DashboardListItem from './Item'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const DashboardList = (): JSX.Element => {
  const { chapters } = useDashboardStore()

  return (
    <ul className={style.DashboardList}>
      {chapters.map((item) => (
        <DashboardListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default DashboardList

import { useMemo } from 'react'

import DashboardListItem from './Item'

import useDashboard from 'store/dashboard'

import style from './style.module.scss'

const DashboardList = (): JSX.Element => {
  const { activeComic, chapters, getChaptersDB } = useDashboard((state) => state)

  useMemo(() => {
    getChaptersDB()
  }, [activeComic])

  return (
    <ul className={style.DashboardList}>
      {chapters.map((item) => (
        <DashboardListItem key={item._id} item={item} />
      ))}
    </ul>
  )
}

export default DashboardList

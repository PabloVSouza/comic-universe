import { useMemo } from 'react'

import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboard from 'store/dashboard'

import style from './style.module.scss'

const ComicDashboard = ({ item }: { item: Comic }): JSX.Element => {
  const { getReadProgressDB, activeComic } = useDashboard()

  useMemo(() => {
    getReadProgressDB()
  }, [activeComic])

  return (
    <div className={style.comicDashboard}>
      {!!item?._id && (
        <>
          <DashboardHeader item={item} />
          <DashboardNav />
          <DashboardList />
        </>
      )}
    </div>
  )
}

export default ComicDashboard

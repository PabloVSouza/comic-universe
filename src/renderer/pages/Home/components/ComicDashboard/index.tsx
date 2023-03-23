import { useMemo } from 'react'

import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboard from 'store/dashboard'

import style from './style.module.scss'

const ComicDashboard = (): JSX.Element => {
  const { getReadProgressDB, activeComic } = useDashboard()

  if (activeComic) {
    useMemo(() => {
      getReadProgressDB()
    }, [activeComic])
  }

  return (
    <div className={style.comicDashboard}>
      {!!activeComic && (
        <>
          <DashboardHeader item={activeComic} />
          <DashboardNav />
          <DashboardList />
        </>
      )}
    </div>
  )
}

export default ComicDashboard

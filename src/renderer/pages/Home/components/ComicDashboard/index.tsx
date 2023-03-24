import { useMemo } from 'react'

import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const ComicDashboard = (): JSX.Element => {
  const { comic, list, setComic, getReadProgressDB } = useDashboardStore()

  if (comic) {
    useMemo(() => {
      getReadProgressDB()
    }, [comic])
  }

  useMemo(() => {
    if (list.length && !comic._id) {
      setComic(list[0])
    }
  }, [list])

  return (
    <div className={style.comicDashboard}>
      {!!comic._id && (
        <>
          <DashboardHeader />
          <DashboardNav />
          <DashboardList />
        </>
      )}
    </div>
  )
}

export default ComicDashboard

import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboardStore from 'store/useDashboardStore'

import style from './style.module.scss'

const ComicDashboard = (): JSX.Element => {
  const { comic } = useDashboardStore()

  return (
    <div className={style.comicDashboard}>
      {!!comic.id && (
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

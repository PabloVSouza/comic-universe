import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'

import style from './style.module.scss'

const ComicDashboard = (): JSX.Element => {
  const { comic } = useDashboardStore()
  const { queue } = useDownloadStore()

  const isDownloading = !!queue.find((item) => item.comicId === comic.id)

  return (
    <div className={style.comicDashboard}>
      {!!comic.id && !isDownloading && (
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

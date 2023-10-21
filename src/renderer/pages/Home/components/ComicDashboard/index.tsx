import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import DashboardHeader from './Header'
import DashboardNav from './Nav'
import DashboardList from './List'

import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

import style from './style.module.scss'

const ComicDashboard = (): JSX.Element => {
  const navigate = useNavigate()

  const { comic } = useDashboardStore()
  const { queue } = useDownloadStore()
  const { currentUser } = usePersistStore()

  useEffect(() => {
    if (!currentUser.id) navigate('/users')
  }, [])

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

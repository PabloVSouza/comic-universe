import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import DashboardHeader from './HomeDashboardHeader/HomeDashboardHeader'
import DashboardNav from './HomeDashboardNavBar/HomeDashboardNavBar'
import DashboardList from './HomeDashboardComicList/HomeDashboardComicList'

import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

import style from './HomeDashboard.module.scss'

const HomeDashboard = (): JSX.Element => {
  const navigate = useNavigate()

  const { comic, list, setComic } = useDashboardStore()
  const { queue } = useDownloadStore()
  const { currentUser } = usePersistStore()

  useEffect(() => {
    if (!currentUser.id) navigate('/users')
  }, [])

  const isDownloading = !!queue.find((item) => item.comicId === comic.id)

  useEffect(() => {
    if (!comic.id && list.length && !queue.find((item) => item.comicId === list[0].id)) {
      setComic(list[0].id)
    }
  }, [queue, list])

  return (
    <div className={style.HomeDashboard}>
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

export default HomeDashboard

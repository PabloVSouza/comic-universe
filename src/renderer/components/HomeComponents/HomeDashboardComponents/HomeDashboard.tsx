import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import HomeDashboardHeader from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardHeader'
import HomeDashboardNav from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardNavBar'
import HomeDashboardList from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardComicList'
import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

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
    <div className="h-full w-full grow flex flex-col gap-px bg-default z-10 mt-px">
      {!!comic.id && !isDownloading && (
        <>
          <HomeDashboardHeader />
          <HomeDashboardNav />
          <HomeDashboardList />
        </>
      )}
    </div>
  )
}

export default HomeDashboard

import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import HomeDashboardHeader from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardHeader'
import HomeDashboardNavBar from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardNavBar'
import HomeDashboardList from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardList'
import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

const HomeDashboard = ({ comicList }: { comicList: ComicInterface[] }): JSX.Element => {
  const navigate = useNavigate()

  const { comic, setComic } = useDashboardStore()
  const { queue } = useDownloadStore()
  const { currentUser } = usePersistStore()

  useEffect(() => {
    if (!currentUser.id) navigate('/users')
  }, [])

  const isDownloading = !!queue.find((item) => item.comicId === comic.id)

  useEffect(() => {
    if (!comic.id && comicList.length && !queue.find((item) => item.comicId === comicList[0].id)) {
      setComic(comicList[0])
    }
  }, [queue, comicList])

  return (
    <div className="h-full w-full grow flex flex-col gap-px bg-default z-10 mt-px">
      {!!comic.id && !isDownloading && (
        <>
          <HomeDashboardHeader comic={comic} />
          <HomeDashboardNavBar comic={comic} />
          <HomeDashboardList comic={comic} />
        </>
      )}
    </div>
  )
}

export default HomeDashboard

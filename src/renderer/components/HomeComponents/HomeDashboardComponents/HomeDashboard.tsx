import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import LoadingOverlay from 'components/LoadingOverlay'
import HomeDashboardHeader from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardHeader'
import HomeDashboardNavBar from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardNavBar'
import HomeDashboardList from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardList'
import useDashboardStore from 'store/useDashboardStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

const { invoke } = useApi()

const HomeDashboard = (): JSX.Element => {
  const navigate = useNavigate()

  const { data: list, isLoading: isLoadingList } = useQuery({
    queryKey: ['comicList'],
    queryFn: async () => (await invoke('dbGetAllComics')) as ComicInterface[],
    initialData: []
  })

  const { comic, setComic } = useDashboardStore()
  const { queue } = useDownloadStore()
  const { currentUser } = usePersistStore()

  useEffect(() => {
    if (!currentUser.id) navigate('/users')
  }, [])

  const isDownloading = !!queue.find((item) => item.comicId === comic.id)

  useEffect(() => {
    if (!comic.id && list.length && !queue.find((item) => item.comicId === list[0].id)) {
      setComic(list[0])
    }
  }, [queue, list])

  return (
    <div className="h-full w-full grow flex flex-col gap-px bg-default z-10 mt-px">
      <LoadingOverlay isLoading={isLoadingList} />
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

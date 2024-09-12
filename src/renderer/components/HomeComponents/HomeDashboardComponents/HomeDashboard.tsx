import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import LoadingOverlay from 'components/LoadingOverlay'
import useApi from 'api'
import HomeDashboardHeader from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardHeader'
import HomeDashboardNavBar from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardNavBar'
import HomeDashboardList from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardList'
import useGlobalStore from 'store/useGlobalStore'
import useDownloadStore from 'store/useDownloadStore'
import usePersistStore from 'store/usePersistStore'

const HomeDashboard = ({ comicList }: { comicList: ComicInterface[] }): JSX.Element => {
  const { invoke } = useApi()
  const { activeComic, setActiveComic } = useGlobalStore()
  const { queue } = useDownloadStore()
  const { currentUser } = usePersistStore()

  const isDownloading = !!queue.find((item) => item.comicId === activeComic.id)

  useEffect(() => {
    if (
      !activeComic.id &&
      comicList.length &&
      !queue.find((item) => item.comicId === comicList[0].id)
    ) {
      setActiveComic(comicList[0])
    }
  }, [queue, comicList])

  const { data: additionalData, isFetching } = useQuery({
    queryKey: ['additionalData', activeComic],
    queryFn: async () =>
      (await invoke('dbGetComicAdditionalData', {
        id: activeComic.id,
        userId: currentUser.id
      })) as ComicInterface,
    enabled: !!activeComic.id
  })

  return (
    <div className="h-full w-full grow flex flex-col gap-px bg-default z-10 mt-px">
      <LoadingOverlay isLoading={isFetching} />
      {!!activeComic.id && !isDownloading && !!additionalData?.chapters.length && (
        <>
          <HomeDashboardHeader comic={activeComic} />
          <HomeDashboardNavBar comic={activeComic} additionalData={additionalData} />
          <HomeDashboardList additionalData={additionalData} />
        </>
      )}
    </div>
  )
}

export default HomeDashboard

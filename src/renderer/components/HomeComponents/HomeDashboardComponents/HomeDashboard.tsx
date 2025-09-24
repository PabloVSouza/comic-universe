import { useQuery } from '@tanstack/react-query'
import LoadingOverlay from 'components/LoadingOverlay'
import useApi from 'api'
import HomeDashboardHeader from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardHeader'
import HomeDashboardNavBar from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardNavBar'
import HomeDashboardList from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardList'
import useGlobalStore from 'store/useGlobalStore'
import usePersistSessionStore from 'store/usePersistSessionStore'

const HomeDashboard = (): React.JSX.Element => {
  const { invoke } = useApi()
  const { activeComic } = useGlobalStore()
  const { currentUser } = usePersistSessionStore()

  const { data: additionalData, isFetching } = useQuery({
    queryKey: ['activeComicData', activeComic],
    queryFn: async () =>
      (await invoke('dbGetComicAdditionalData', {
        id: activeComic.id,
        userId: currentUser.id
      })) as IComic,
    enabled: !!activeComic.id
  })

  return (
    <div className="h-full w-full grow flex flex-col gap-px bg-default z-10 mt-px">
      <LoadingOverlay isLoading={isFetching} />
      {!!activeComic.id && !!additionalData?.chapters?.length && (
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

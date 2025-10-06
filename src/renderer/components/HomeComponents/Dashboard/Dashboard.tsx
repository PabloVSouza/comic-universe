import { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApi } from 'hooks'
import { useGlobalStore, usePersistSessionStore } from 'store'
import { LoadingOverlay } from 'components/ui'
import DashboardHeader from './DashboardHeader'
import DashboardList from './DashboardList'
import DashboardNav from './DashboardNav'

const Dashboard: FC = () => {
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
          <DashboardHeader comic={activeComic} />
          <DashboardNav comic={activeComic} additionalData={additionalData} />
          <DashboardList additionalData={additionalData} />
        </>
      )}
    </div>
  )
}

export default Dashboard

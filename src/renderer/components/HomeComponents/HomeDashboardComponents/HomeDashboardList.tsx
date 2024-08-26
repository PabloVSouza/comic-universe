import { useQuery } from '@tanstack/react-query'
import useApi from 'api'
import usePersistStore from 'store/usePersistStore'
import DashboardListItem from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardListItem'
import LoadingOverlay from 'components/LoadingOverlay'

const { invoke } = useApi()

const HomeDashboardComicList = ({ comic }: { comic: ComicInterface }): JSX.Element => {
  const { currentUser } = usePersistStore()

  const { data: comicData, isLoading } = useQuery({
    queryKey: ['comicData', comic],
    queryFn: async () =>
      (await invoke('dbGetComicComplete', {
        id: comic.id,
        userId: currentUser.id
      })) as ComicInterface
  })

  return (
    <ul className="grow overflow-auto flex flex-col items-start gap-px">
      <LoadingOverlay isLoading={isLoading} />
      {comicData?.chapters?.map((item) => <DashboardListItem key={item.id} item={item} />)}
    </ul>
  )
}

export default HomeDashboardComicList

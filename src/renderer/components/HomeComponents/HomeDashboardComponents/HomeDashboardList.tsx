import DashboardListItem from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardListItem'
import LoadingOverlay from 'components/LoadingOverlay'
import useGlobalStore from 'store/useGlobalStore'

const HomeDashboardComicList = ({ additionalData }: { additionalData: IComic }): JSX.Element => {
  const chapters = additionalData.chapters
  const { queue } = useGlobalStore()

  const inQueue = chapters.some(
    (chapter) => !chapter.pages && queue.some((q) => q.id === chapter.id)
  )

  return (
    <ul className="grow overflow-auto flex flex-col items-start gap-px">
      <LoadingOverlay isLoading={inQueue} />
      {additionalData?.chapters?.map((item) => <DashboardListItem key={item.id} item={item} />)}
    </ul>
  )
}

export default HomeDashboardComicList

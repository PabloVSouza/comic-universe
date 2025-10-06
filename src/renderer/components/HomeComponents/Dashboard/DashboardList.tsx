import { FC } from 'react'
import { useGlobalStore } from 'store'
import { LoadingOverlay } from 'components/UiComponents'
import DashboardListItem from './DashboardListItem'

const DashboardList: FC<{
  additionalData: IComic
}> = ({ additionalData }) => {
  const chapters = additionalData.chapters || []
  const { queue } = useGlobalStore()

  const inQueue = chapters.some(
    (chapter) => !chapter.pages && queue.some((q) => q.id === chapter.id)
  )

  return (
    <ul className="grow overflow-auto flex flex-col items-start gap-px">
      <LoadingOverlay isLoading={inQueue} />
      {additionalData?.chapters?.map((item) => (
        <DashboardListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default DashboardList

import DashboardListItem from '../HomeDashboardComicListItem'
import useDashboardStore from 'store/useDashboardStore'

const HomeDashboardComicList = (): JSX.Element => {
  const { comic } = useDashboardStore()

  return (
    <ul className="grow overflow-auto flex flex-col gap-px">
      {comic.chapters.map((item) => (
        <DashboardListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default HomeDashboardComicList

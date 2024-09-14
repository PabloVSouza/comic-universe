import DashboardListItem from 'components/HomeComponents/HomeDashboardComponents/HomeDashboardListItem'

const HomeDashboardComicList = ({ additionalData }: { additionalData: IComic }): JSX.Element => {
  return (
    <ul className="grow overflow-auto flex flex-col items-start gap-px">
      {additionalData?.chapters?.map((item) => <DashboardListItem key={item.id} item={item} />)}
    </ul>
  )
}

export default HomeDashboardComicList
